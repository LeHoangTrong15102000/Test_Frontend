import { DishStatusValues, OrderStatusValues } from '@/constants/type'
import z from 'zod'

export const OrderItemSchema = z.object({
  id: z.number(),
  status: z.enum(OrderStatusValues),
  createdAt: z.date(),
  updatedAt: z.date()
})


export const GetListOrder = z.object({})

export const GetOrderDetail = z.object({})

export const CreateOrderBody = z.object({})


export const UpdateOrderBody = z.object({})


export const DeleteOrder =  z.object({})