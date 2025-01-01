import orderApiRequest from '@/apiRequests/order'
import { CreateOrderBodyType, DeleteOrderBodyType, UpdateOrderBodyType } from '@/schemaValidations/order.schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useGetOrderListQuery = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: orderApiRequest.getListOrder
  })
}

export const useGetOrderQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => orderApiRequest.getOrder(id),
    enabled
  })
}

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateOrderBodyType) => orderApiRequest.addOrder(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['orders']
      })
    }
  })
}

export const useUpdateOrderMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: { Id: number } & UpdateOrderBodyType) => orderApiRequest.updateOrder(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['orders'],
        exact: true
      })
    }
  })
}

export const useDeleteOrderMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: DeleteOrderBodyType) => orderApiRequest.deleteOrder(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['orders']
      })
    }
  })
}
