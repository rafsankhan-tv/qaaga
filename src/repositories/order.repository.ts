import { marketplaceStore } from '../services/marketplaceStore.ts';
import { dbService } from '../db/database.ts';
import type { ProductOrder } from '../types/index.ts';
import {
  assertProductionWriteAllowed,
  handleRepositoryWriteError,
} from '../lib/persistence-policy.ts';

/**
 * Data Access Layer (Repository Pattern) - Order Repository
 * PostgreSQL-backed with in-memory sync and resilient fallback.
 */
export class OrderRepository {
  async findById(orderId: string): Promise<ProductOrder | null> {
    if (dbService.isDatabaseConfigured()) {
      try {
        const sql = `SELECT * FROM orders WHERE id = $1 OR order_number = $1 LIMIT 1`;
        const res = await dbService.query(sql, [orderId]);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          return {
            id: row.id,
            orderNumber: row.order_number || row.id,
            customerId: row.customer_id,
            customerName: row.customer_name,
            customerPhone: row.customer_phone,
            deliveryAddress: row.shipping_address || row.delivery_address || '',
            district: row.district || row.delivery_district || 'ঢাকা',
            thana: row.thana || 'মিরপুর',
            area: row.area || 'মিরপুর ১০',
            paymentMethod: row.payment_method || 'COD',
            paymentStatus: row.payment_status || 'PENDING',
            orderStatus: row.order_status || 'PENDING',
            subtotal: Number(row.subtotal || row.subtotal_amount || 0),
            deliveryFee: Number(row.delivery_fee || 0),
            discountAmount: Number(row.discount_amount || 0),
            totalAmount: Number(row.total_amount || 0),
            items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []),
            createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
            updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('PostgreSQL findById order fallback:', err);
      }
    }
    const orders = marketplaceStore.getOrders();
    return orders.find((o) => o.id === orderId || o.orderNumber === orderId) || null;
  }

  async findByCustomerId(customerId: string): Promise<ProductOrder[]> {
    if (dbService.isDatabaseConfigured()) {
      try {
        const sql = `SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC`;
        const res = await dbService.query(sql, [customerId]);
        if (res.rows.length > 0) {
          return res.rows.map((row) => ({
            id: row.id,
            orderNumber: row.order_number || row.id,
            customerId: row.customer_id,
            customerName: row.customer_name,
            customerPhone: row.customer_phone,
            deliveryAddress: row.shipping_address || row.delivery_address || '',
            district: row.district || row.delivery_district || 'ঢাকা',
            thana: row.thana || 'মিরপুর',
            area: row.area || 'মিরপুর ১০',
            paymentMethod: row.payment_method || 'COD',
            paymentStatus: row.payment_status || 'PENDING',
            orderStatus: row.order_status || 'PENDING',
            subtotal: Number(row.subtotal || row.subtotal_amount || 0),
            deliveryFee: Number(row.delivery_fee || 0),
            discountAmount: Number(row.discount_amount || 0),
            totalAmount: Number(row.total_amount || 0),
            items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []),
            createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
            updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn('PostgreSQL findByCustomerId order fallback:', err);
      }
    }
    const orders = marketplaceStore.getOrders();
    return orders.filter((o) => o.customerId === customerId);
  }

  async findByCustomerPhone(phone: string): Promise<ProductOrder[]> {
    const orders = marketplaceStore.getOrders();
    return orders.filter((o) => o.customerPhone === phone);
  }

  async create(order: ProductOrder): Promise<ProductOrder> {
    assertProductionWriteAllowed('Create product order');
    if (dbService.isDatabaseConfigured()) {
      try {
        const sql = `
          INSERT INTO orders (
            id, order_number, customer_id, customer_name, customer_phone,
            shipping_address, district, area,
            payment_method, payment_status, order_status,
            subtotal, delivery_fee, discount_amount, total_amount,
            items, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `;
        const params = [
          order.id,
          order.orderNumber,
          order.customerId || null,
          order.customerName,
          order.customerPhone,
          order.deliveryAddress || 'মিরপুর, ঢাকা',
          order.district || 'ঢাকা',
          order.area || order.thana || 'মিরপুর',
          order.paymentMethod || 'COD',
          order.paymentStatus || 'PENDING',
          order.orderStatus || 'PENDING',
          order.subtotal,
          order.deliveryFee || 0,
          order.discountAmount || 0,
          order.totalAmount,
          JSON.stringify(order.items || []),
        ];
        await dbService.query(sql, params);
      } catch (err) {
        handleRepositoryWriteError('Order creation', err);
      }
    }
    const orders = marketplaceStore.getOrders();
    orders.unshift(order);
    return order;
  }

  async updateStatus(orderId: string, status: ProductOrder['orderStatus'], note?: string): Promise<ProductOrder | null> {
    assertProductionWriteAllowed('Update order status');
    if (dbService.isDatabaseConfigured()) {
      try {
        const sql = `
          UPDATE orders 
          SET order_status = $2, admin_note = COALESCE($3, admin_note), updated_at = NOW() 
          WHERE id = $1 OR order_number = $1
        `;
        await dbService.query(sql, [orderId, status, note || null]);
      } catch (err) {
        handleRepositoryWriteError('Order status update', err);
      }
    }
    const order = await this.findById(orderId);
    if (!order) return null;
    order.orderStatus = status;
    return order;
  }

  async listAll(limit = 50, page = 1): Promise<{ orders: ProductOrder[]; total: number }> {
    if (dbService.isDatabaseConfigured()) {
      try {
        const offset = (page - 1) * limit;
        const countRes = await dbService.query(`SELECT COUNT(*)::int AS total FROM orders`);
        const total = countRes.rows[0]?.total || 0;
        const res = await dbService.query(`SELECT * FROM orders ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
        if (res.rows.length > 0) {
          const orders = res.rows.map((row) => ({
            id: row.id,
            orderNumber: row.order_number || row.id,
            customerId: row.customer_id,
            customerName: row.customer_name,
            customerPhone: row.customer_phone,
            deliveryAddress: row.delivery_address || '',
            district: row.delivery_district || row.district || 'ঢাকা',
            thana: row.thana || 'মিরপুর',
            area: row.area || 'মিরপুর ১০',
            paymentMethod: row.payment_method || 'COD',
            paymentStatus: row.payment_status || 'PENDING',
            orderStatus: row.order_status || 'PENDING',
            subtotal: Number(row.subtotal_amount || row.subtotal || 0),
            deliveryFee: Number(row.delivery_fee || 0),
            discountAmount: Number(row.discount_amount || 0),
            totalAmount: Number(row.total_amount || 0),
            items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []),
            createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
            updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
          }));
          return { orders, total };
        }
      } catch (err) {
        console.warn('PostgreSQL listAll orders warning:', err);
      }
    }
    const orders = marketplaceStore.getOrders();
    const start = (page - 1) * limit;
    return {
      orders: orders.slice(start, start + limit),
      total: orders.length,
    };
  }
}

export const orderRepository = new OrderRepository();
