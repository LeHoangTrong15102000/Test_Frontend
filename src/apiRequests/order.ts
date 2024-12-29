import http from '@/lib/http'
import { CreateOrderBodyType, OrderResType, UpdateOrderBodyType } from '@/schemaValidations/order.schema'

const prefix = 'mjrsgmhhnqebxaz/records'

const orderApiRequest = {
  getListOrder: () => http.get<any>(`${prefix}`),
  addOrder: (body: CreateOrderBodyType) => http.post<any>(`${prefix}`, body),
  getOrder: (recordId: number) => http.get<OrderResType>(`${prefix}/${recordId}`),
  updateOrder: (body: UpdateOrderBodyType) => http.patch<any>(`${prefix}`, body),
  deleteOrder: (recordId: number) => http.delete<any>(`${prefix}/${recordId}`),
  countOrder: () => http.get<any>(`${prefix}/count`)
}

export default orderApiRequest
