import { orderRepository } from '../../repositories/order.repository';
import { catalogRepository } from '../../repositories/catalog.repository';
import { sanitizeString, sanitizeObject } from '../../lib/auth-security';
import { OrderCheckoutInput } from '../../lib/validation';
import { ProductOrder, ProductOrderItem } from '../../types';

export interface CreateOrderResult {
  success: boolean;
  message: string;
  order?: ProductOrder;
  errorCode?: string;
  statusCode?: number;
}

/**
 * Business Logic Layer - Order Management Service
 */
export class OrderService {
  async createOrder(
    input: OrderCheckoutInput,
    authenticatedUserId?: string | null
  ): Promise<CreateOrderResult> {
    let calculatedSubtotal = 0;
    const validatedItems: ProductOrderItem[] = [];

    for (const item of input.items) {
      const product = catalogRepository.getProductById(item.productId);
      const unitPrice = product ? (product.discountPrice || product.price) : item.price;
      const itemSubtotal = unitPrice * item.quantity;
      calculatedSubtotal += itemSubtotal;

      validatedItems.push({
        productId: item.productId,
        title: sanitizeString(item.productTitle || product?.title || 'পণ্য'),
        price: unitPrice,
        quantity: item.quantity,
        image: item.image || (product?.images && product.images[0]) || '',
        sellerId: item.sellerId || product?.sellerId || 'seller-main',
      });
    }

    const deliveryFee = input.deliveryFee ?? (input.district === 'ঢাকা' ? 60 : 120);
    const discountAmount = Math.max(0, input.discountAmount || 0);
    const totalAmount = Math.max(0, calculatedSubtotal + deliveryFee - discountAmount);

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderId = `ord-${Date.now().toString(36)}-${randomSuffix}`;
    const orderNumber = `QAAGA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    let mappedPaymentMethod: 'COD' | 'ONLINE_BKASH' | 'ONLINE_CARD' = 'COD';
    if (input.paymentMethod === 'BKASH') {
      mappedPaymentMethod = 'ONLINE_BKASH';
    } else if (input.paymentMethod === 'CARD' || input.paymentMethod === 'SSLCOMMERZ') {
      mappedPaymentMethod = 'ONLINE_CARD';
    }

    const now = new Date().toISOString();
    const newOrder: ProductOrder = {
      id: orderId,
      orderNumber,
      customerId: authenticatedUserId || `anon_${Date.now()}`,
      customerName: sanitizeString(input.customerName),
      customerPhone: sanitizeString(input.customerPhone),
      deliveryAddress: sanitizeString(input.shippingAddress),
      district: sanitizeString(input.district),
      thana: 'সদর',
      area: sanitizeString(input.area),
      items: sanitizeObject(validatedItems),
      subtotal: calculatedSubtotal,
      deliveryFee,
      discountAmount,
      totalAmount,
      paymentMethod: mappedPaymentMethod,
      orderStatus: 'PENDING',
      createdAt: now,
      updatedAt: now,
    };

    await orderRepository.create(newOrder);

    return {
      success: true,
      message: 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে।',
      order: newOrder,
      statusCode: 201,
    };
  }

  async getOrderById(orderId: string, requestingUserId?: string, isSuperAdmin = false): Promise<ProductOrder | null> {
    const order = await orderRepository.findById(orderId);
    if (!order) return null;

    if (requestingUserId && !isSuperAdmin && order.customerId && order.customerId !== requestingUserId) {
      return null;
    }
    return order;
  }

  async listUserOrders(userId: string): Promise<ProductOrder[]> {
    return orderRepository.findByCustomerId(userId);
  }

  async listAllOrders(limit = 50, page = 1): Promise<{ orders: ProductOrder[]; total: number }> {
    return orderRepository.listAll(limit, page);
  }
}

export const orderService = new OrderService();
