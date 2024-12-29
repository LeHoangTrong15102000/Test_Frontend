import z from 'zod'

export const ProductSchema = z.object({
  Id: z.number(),
  name: z.string(),
  price: z.coerce.number().positive(),
  cost: z.coerce.number().positive(),
  CreatedAt: z.date(),
  UpdatedAt: z.date()
})

export const ProductRes = ProductSchema

export type ProductResType = z.TypeOf<typeof ProductRes>

export const ProductListRes = z.intersection(
  z.object({
    list: z.array(ProductSchema)
  }),
  z.record(z.string(), z.unknown())
)

export type ProductListResType = z.TypeOf<typeof ProductListRes>

export const CreateProductBody = z.object({
  name: z.string().min(1).max(256),
  price: z.coerce.number().positive(),
  cost: z.coerce.number().positive()
})

export type CreateProductBodyType = z.TypeOf<typeof CreateProductBody>

export const UpdateProductBody = z.object({
  name: z.string().min(1).max(256).optional(),
  price: z.coerce.number().positive().optional(),
  cost: z.coerce.number().positive().optional()
})

export type UpdateProductBodyType = z.TypeOf<typeof UpdateProductBody>
