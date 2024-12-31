import productApiRequest from '@/apiRequests/product'
import { CreateProductBodyType, DeleteProductBodyType, UpdateProductBodyType } from '@/schemaValidations/product.schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useGetProductListQuery = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: productApiRequest.getListProduct
  })
}

export const useGetProductQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productApiRequest.getProduct(id),
    enabled
  })
}

export const useAddProductMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateProductBodyType) => productApiRequest.addProduct(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['products']
      })
    }
  })
}

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateProductBodyType) => productApiRequest.updateProduct(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['products'],
        exact: true
      })
    }
  })
}

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: DeleteProductBodyType) => productApiRequest.deleteProduct(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['products']
      })
    }
  })
}
