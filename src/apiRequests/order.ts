import http from '@/lib/http'
import {
  CreateOrderBodyType,
  DeleteOrderBodyType,
  OrderResType,
  UpdateOrderBodyType
} from '@/schemaValidations/order.schema'

const prefix = 'mjrsgmhhnqebxaz/records'

const orderApiRequest = {
  getListOrder: () => http.get<any>(`${prefix}`),
  addOrder: (body: CreateOrderBodyType) => http.post<any>(`${prefix}`, body),
  getOrder: (recordId: number) => http.get<OrderResType>(`${prefix}/${recordId}`),
  updateOrder: (body: UpdateOrderBodyType) => http.patch<any>(`${prefix}`, body),
  deleteOrder: (body: DeleteOrderBodyType) => http.delete<any>(`${prefix}`, body),
  countOrder: () => http.get<any>(`${prefix}/count`)
}

export default orderApiRequest
