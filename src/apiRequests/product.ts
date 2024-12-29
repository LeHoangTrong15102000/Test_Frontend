import http from '@/lib/http'
import { CreateProductBodyType, ProductResType, UpdateProductBodyType } from '@/schemaValidations/product.schema'

const prefix = 'mozmi7hzy7grmal/records'

const productApiRequest = {
  getListProduct: () => http.get<any>(`${prefix}`),
  addProduct: (body: CreateProductBodyType) => http.post<any>(`${prefix}`, body),
  getProduct: (recordId: number) => http.get<ProductResType>(`${prefix}/${recordId}`),
  updateProduct: (body: UpdateProductBodyType) => http.patch<any>(`${prefix}`, body),
  deleteProduct: (recordId: number) => http.delete<any>(`${prefix}/${recordId}`),
  countProduct: () => http.get<any>(`${prefix}/count`)
}

export default productApiRequest
