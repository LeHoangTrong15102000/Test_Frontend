import { OrderStatusValues } from '@/constants/type'
import z from 'zod'

export const BaseOrderSchema = z.object({
  customer_phone: z.string().min(9).max(15),
  customer_name: z.string().min(10).max(100),
  quantity_total: z.coerce.number().positive(),
  cost_total: z.coerce.number().positive(),
  price_total: z.coerce.number().nonnegative(),
  shipping_fee: z.coerce.number().positive(),
  payment_total: z.coerce.number().positive(),
  customer_address: z.string().max(256),
  order_status: z.enum(OrderStatusValues).transform((value) => parseInt(value, 10)),
  // order_status: z.enum(OrderStatusValues),
  // order_status: z.preprocess((value) => value.toString(), z.enum(OrderStatusValues)),
  order_date: z.string().datetime({ offset: true })
})

export const OrderSchema = BaseOrderSchema.extend({
  Id: z.number(),
  CreatedAt: z.date(),
  UpdatedAt: z.date()
})

export const OrderRes = OrderSchema

export type OrderResType = z.TypeOf<typeof OrderRes>

export const OrderListRes = z.intersection(
  z.object({
    list: z.array(OrderSchema)
  }),
  z.record(z.string(), z.unknown())
)

export type OrderListResType = z.TypeOf<typeof OrderListRes>

export const CreateOrderBody = BaseOrderSchema

export type CreateOrderBodyType = z.TypeOf<typeof CreateOrderBody>

export const UpdateOrderBody = BaseOrderSchema.partial()

export type UpdateOrderBodyType = z.TypeOf<typeof UpdateOrderBody>

export const DeleteOrderBody = z.object({
  Id: z.number()
})

export type DeleteOrderBodyType = z.TypeOf<typeof DeleteOrderBody>
