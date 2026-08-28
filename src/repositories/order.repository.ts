import { marketplaceStore } from '../services/marketplaceStore';
import { ProductOrder } from '../types';

/**
 * Data Access Layer (Repository Pattern) - Order Repository
 */
export class OrderRepository {
  async findById(orderId: string): Promise<ProductOrder | null> {
    const orders = marketplaceStore.getOrders();
    return orders.find((o) => o.id === orderId || o.orderNumber === orderId) || null;
  }

  async findByCustomerId(customerId: string): Promise<ProductOrder[]> {
    const orders = marketplaceStore.getOrders();
    return orders.filter((o) => o.customerId === customerId);
  }

  async findByCustomerPhone(phone: string): Promise<ProductOrder[]> {
    const orders = marketplaceStore.getOrders();
    return orders.filter((o) => o.customerPhone === phone);
  }

  async create(order: ProductOrder): Promise<ProductOrder> {
    const orders = marketplaceStore.getOrders();
    orders.unshift(order);
    return order;
  }

  async updateStatus(orderId: string, status: ProductOrder['orderStatus'], note?: string): Promise<ProductOrder | null> {
    const order = await this.findById(orderId);
    if (!order) return null;
    order.orderStatus = status;
    if (note) {
      order.adminNote = note;
    }
    order.updatedAt = new Date().toISOString();
    return order;
  }

  async listAll(limit = 50, page = 1): Promise<{ orders: ProductOrder[]; total: number }> {
    const orders = marketplaceStore.getOrders();
    const start = (page - 1) * limit;
    return {
      orders: orders.slice(start, start + limit),
      total: orders.length,
    };
  }
}

export const orderRepository = new OrderRepository();
