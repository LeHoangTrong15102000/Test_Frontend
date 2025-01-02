import orderItemApiRequest from '@/apiRequests/orderItem'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CreateOrderItemBodyType,
  DeleteOrderItemBodyType,
  OrderItemListResType,
  UpdateOrderItemBodyType
} from '../schemaValidations/orderItem.schema'

type OrderItemType = OrderItemListResType['list'][0]

export const useGetOrderItemListQuery = ({ orderId, enabled }: { orderId?: number; enabled?: boolean }) => {
  return useQuery({
    queryKey: ['order-items', orderId],
    queryFn: () => orderItemApiRequest.getListOrderItem(orderId),
    enabled
  })
}

export const useGetOrderItemQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ['order-items', id],
    queryFn: () => orderItemApiRequest.getOrderItem(id),
    enabled
  })
}

export const useCreateOrderItemMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateOrderItemBodyType) => orderItemApiRequest.addOrderItem(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['order-items']
      })
    }
  })
}

export const useUpdateOrderItemMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: { Id: number } & UpdateOrderItemBodyType) => orderItemApiRequest.updateOrderItem(body),
    // onMutate: async (updatedItem) => {
    //   await queryClient.cancelQueries({ queryKey: ['order-items', updatedItem.order_id] })

    //   const previousData = queryClient.getQueryData(['order-items', updatedItem.order_id])

    //   if (previousData) {
    //     const newData = JSON.parse(JSON.stringify(previousData))
    //     newData.payload.list = newData.payload.list.map((item: OrderItemType) => {
    //       if (item.Id === updatedItem.Id) {
    //         return {
    //           ...item,
    //           quantity: updatedItem.quantity,
    //           price_total: updatedItem.price_total,
    //           cost_total: updatedItem.cost_total
    //         }
    //       }
    //       return item
    //     })
    //     queryClient.setQueryData(['order-items', updatedItem.order_id], newData)
    //   }
    //   return { previousData }
    // },
    // onError: (error, updatedItem, context) => {
    //   if (context?.previousData) {
    //     queryClient.setQueryData(['order-items', updatedItem.order_id], context.previousData)
    //   }
    // },
    // onSettled: (data, error, variables) => {
    //   queryClient.invalidateQueries({
    //     queryKey: ['order-items', variables.order_id],
    //     exact: true
    //   })
    // }
    onSuccess: (data, updatedItem, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['order-items', updatedItem.order_id],
        exact: true
      })
    }
  })
}

export const useDeleteOrderItemMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: DeleteOrderItemBodyType) => orderItemApiRequest.deleteOrderItem(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['order-items']
      })
    }
  })
}
