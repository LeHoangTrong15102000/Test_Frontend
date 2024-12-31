import http from '@/lib/http'
import { ProductListResType } from '../schemaValidations/product.schema'
import {
  CreateProductBodyType,
  DeleteProductBodyType,
  ProductResType,
  UpdateProductBodyType
} from '@/schemaValidations/product.schema'

const prefix = 'mozmi7hzy7grmal/records'

const productApiRequest = {
  getListProduct: () => http.get<ProductListResType>(`${prefix}`),
  addProduct: (body: CreateProductBodyType) => http.post<any>(`${prefix}`, body),
  getProduct: (recordId: number) => http.get<ProductResType>(`${prefix}/${recordId}`),
  updateProduct: (body: UpdateProductBodyType) => http.patch<any>(`${prefix}`, body),
  deleteProduct: (body: DeleteProductBodyType) => http.delete<{}>(`${prefix}`, body),
  countProduct: () => http.get<any>(`${prefix}/count`)
}

export default productApiRequest
