import orderItemApiRequest from '@/apiRequests/orderItem'
import { CreateOrderBodyType, DeleteOrderBodyType, UpdateOrderBodyType } from '@/schemaValidations/order.schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreateOrderItemBodyType, DeleteOrderItemBodyType } from '../schemaValidations/orderItem.schema'

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
    mutationFn: (body: UpdateOrderBodyType) => orderItemApiRequest.updateOrderItem(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['order-items'],
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
