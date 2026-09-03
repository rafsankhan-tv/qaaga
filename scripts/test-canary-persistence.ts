/**
 * QAAGA Phase 1 - Restart Persistence Proof
 * Canary record insertion and verification across service restarts.
 */
import { dbService } from '../src/db/database.ts';
import { userRepository } from '../src/repositories/user.repository.ts';
import { orderRepository } from '../src/repositories/order.repository.ts';

const CANARY_USER_ID = 'canary-user-restart-proof';
const CANARY_ORDER_ID = 'canary-order-restart-proof';
const CANARY_PHONE = '+8801999999999';

async function stepInsert() {
  console.log('[CANARY] Step 1: Inserting Canary records into PostgreSQL...');

  // Delete previous canary if any
  await dbService.query('DELETE FROM orders WHERE id = $1', [CANARY_ORDER_ID]);
  await dbService.query('DELETE FROM users WHERE id = $1', [CANARY_USER_ID]);

  // Insert Canary User
  const canaryUser = await userRepository.create({
    id: CANARY_USER_ID,
    fullName: 'CANARY PERSISTENCE AUDITOR',
    phone: CANARY_PHONE,
    email: 'canary@qaaga.com',
    gender: 'other',
    roles: ['SUPER_ADMIN'],
    activeRole: 'SUPER_ADMIN',
    district: 'ঢাকা',
    area: 'গুলশান',
    address: 'HQ Canary Tower',
    isVerified: true,
    accountStatus: 'active',
    rating: 5.0,
    reviewCount: 99,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Insert Canary Order
  const canaryOrder = await orderRepository.create({
    id: CANARY_ORDER_ID,
    orderNumber: 'ORD-CANARY-PROOF-2026',
    customerId: CANARY_USER_ID,
    customerName: 'CANARY PERSISTENCE AUDITOR',
    customerPhone: CANARY_PHONE,
    deliveryAddress: 'HQ Canary Tower, Level 12',
    district: 'ঢাকা',
    thana: 'গুলশান',
    area: 'গুলশান',
    paymentMethod: 'BKASH',
    paymentStatus: 'PAID',
    orderStatus: 'DELIVERED',
    subtotal: 9999,
    deliveryFee: 0,
    discountAmount: 0,
    totalAmount: 9999,
    items: [
      {
        productId: 'prod-canary',
        productName: 'Canary Proof Item',
        quantity: 1,
        unitPrice: 9999,
        totalPrice: 9999,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  console.log('[CANARY] Inserted User:', canaryUser?.id, canaryUser?.phone);
  console.log('[CANARY] Inserted Order:', canaryOrder?.id, canaryOrder?.orderNumber, canaryOrder?.totalAmount);
  console.log('[CANARY] Step 1 Complete: Canary records successfully written to disk.');
}

async function stepVerify() {
  console.log('[CANARY] Step 2: Querying Canary records from PostgreSQL after restart...');

  const user = await userRepository.findById(CANARY_USER_ID);
  const order = await orderRepository.findById(CANARY_ORDER_ID);

  if (!user || user.id !== CANARY_USER_ID || user.phone !== CANARY_PHONE) {
    console.error('[CANARY FAIL] Canary user not found or corrupted after restart!', user);
    process.exit(1);
  }

  if (!order || order.id !== CANARY_ORDER_ID || order.totalAmount !== 9999) {
    console.error('[CANARY FAIL] Canary order not found or corrupted after restart!', order);
    process.exit(1);
  }

  // Direct SQL verification
  const userSql = await dbService.query('SELECT id, full_name, phone FROM users WHERE id = $1', [CANARY_USER_ID]);
  const orderSql = await dbService.query('SELECT id, order_number, total_amount, order_status FROM orders WHERE id = $1', [CANARY_ORDER_ID]);

  if (userSql.rows.length === 0 || orderSql.rows.length === 0) {
    console.error('[CANARY FAIL] Canary records missing in raw SQL queries!');
    process.exit(1);
  }

  console.log('[CANARY PASS] User verified intact:', userSql.rows[0]);
  console.log('[CANARY PASS] Order verified intact:', orderSql.rows[0]);
  console.log('[CANARY SUCCESS] Persistence Proof Complete: All data survived restart perfectly!');
}

async function main() {
  const mode = process.argv[2] || 'verify';
  if (mode === 'insert') {
    await stepInsert();
  } else {
    await stepVerify();
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('Canary script error:', err);
  process.exit(1);
});
