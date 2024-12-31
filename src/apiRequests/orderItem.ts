import http from '@/lib/http'
import {
  CreateOrderItemBodyType,
  DeleteOrderItemBodyType,
  OrderItemListResType,
  OrderItemResType,
  UpdateOrderItemBodyType
} from '@/schemaValidations/orderItem.schema'

const prefix = 'mbkl49vjwpgtw92/records'
const orderItemApiRequest = {
  getListOrderItem: (orderId?: number) => {
    const params: Record<string, string> = orderId ? { where: `(order_id,eq,${orderId})` } : {}
    return http.get<OrderItemListResType>(`${prefix}`, { params })
  },
  addOrderItem: (body: CreateOrderItemBodyType) => http.post<any>(`${prefix}`, body),
  getOrderItem: (recordId: number) => http.get<OrderItemResType>(`${prefix}/${recordId}`),
  updateOrderItem: (body: UpdateOrderItemBodyType) => http.patch<any>(`${prefix}`, body),
  deleteOrderItem: (body: DeleteOrderItemBodyType) => http.delete<{}>(`${prefix}`, body),
  countOrderItem: () => http.get<any>(`${prefix}/count`)
}

export default orderItemApiRequest
