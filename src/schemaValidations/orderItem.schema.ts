import z from 'zod'

export const BaseOrderItemSchema = z.object({
  order_id: z.number().positive(),
  product_id: z.number().positive(),
  product_name: z.string().max(100),
  quantity: z.number().positive(),
  cost: z.number().positive(),
  price: z.number().positive(),
  cost_total: z.number().positive(),
  price_total: z.number().positive(),
  image: z.string().optional()
})

export const OrderItemSchema = BaseOrderItemSchema.extend({
  Id: z.number(),
  CreatedAt: z.string().datetime({ offset: true }),
  UpdatedAt: z.string().datetime({ offset: true })
})

export const OrderItemRes = OrderItemSchema

export type OrderItemResType = z.TypeOf<typeof OrderItemRes>

export const OrderItemListRes = z.intersection(
  z.object({
    list: z.array(OrderItemSchema)
  }),
  z.record(z.string(), z.unknown())
)

export type OrderItemListResType = z.TypeOf<typeof OrderItemListRes>

export const CreateOrderItemBody = BaseOrderItemSchema

export type CreateOrderItemBodyType = z.TypeOf<typeof CreateOrderItemBody>

export const UpdateOrderItemBody = BaseOrderItemSchema.partial()

export type UpdateOrderItemBodyType = z.TypeOf<typeof UpdateOrderItemBody>

export const DeleteOrderItemBody = z.object({
  Id: z.number()
})

export type DeleteOrderItemBodyType = z.TypeOf<typeof DeleteOrderItemBody>
