'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { Package, PlusCircle, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { getVietnameseOrderStatus, handleErrorApi } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { useCreateOrderMutation } from '@/queries/useOrder'
import { CreateOrderBody, CreateOrderBodyType } from '@/schemaValidations/order.schema'
import { OrderStatus, OrderStatusValues } from '@/constants/type'
import { useGetProductListQuery } from '@/queries/useProduct'
import { useCreateOrderItemMutation } from '@/queries/useOrderItem'
import productApiRequest from '@/apiRequests/product'
import Image from 'next/image'
import Quantity from './quantity'
import { formatCurrency } from '../../../../lib/utils'

type SelectedProductType = {
  productId: number
  quantity: number
  name: string
  cost: number
  price: number
}

export default function AddOrder() {
  const [open, setOpen] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<SelectedProductType[]>([])

  const { data } = useGetProductListQuery()
  const productList = useMemo(() => data?.payload.list ?? [], [data])

  const createOrderMutation = useCreateOrderMutation()
  const createOrderItemMutation = useCreateOrderItemMutation()

  const form = useForm<CreateOrderBodyType>({
    resolver: zodResolver(CreateOrderBody),
    defaultValues: {
      customer_phone: '',
      customer_name: '',
      customer_address: '',
      shipping_fee: 0,
      order_status: parseInt(OrderStatus.NEW, 10),
      order_date: ''
    }
  })

  const customer_name = form.watch('customer_name')
  const customer_phone = form.watch('customer_phone')
  const customer_address = form.watch('customer_address')
  const shipping_fee = form.watch('shipping_fee')
  const order_status = form.watch('order_status')
  const order_date = form.watch('order_date')

  const reset = () => {
    form.reset()
    setSelectedProducts([])
    setOpen(false)
  }

  const handleProductQuantityChange = ({ productId, quantity, name, cost, price }: SelectedProductType) => {
    setSelectedProducts((prevSelectedProducts) => {
      if (quantity === 0) {
        return prevSelectedProducts.filter((product) => product.productId !== productId)
      }
      const currentProductIndex = prevSelectedProducts.findIndex((product) => product.productId === productId)
      if (currentProductIndex === -1) {
        return [...prevSelectedProducts, { productId, quantity, name, cost, price }]
      }

      const newSelectedProducts = [...prevSelectedProducts]
      newSelectedProducts[currentProductIndex] = { ...newSelectedProducts[currentProductIndex], quantity }

      return newSelectedProducts
    })
  }

  const calculateTotalsFunc = (selectedProducts: SelectedProductType[], shippingFee: number) => {
    const price_total = selectedProducts.reduce((result, product) => result + product.quantity * product.price, 0)
    const cost_total = selectedProducts.reduce((result, product) => result + product.quantity * product.cost, 0)
    const quantity_total = selectedProducts.reduce((result, product) => result + product.quantity, 0)
    const payment_total = price_total + Number(shippingFee)

    return { price_total, cost_total, quantity_total, payment_total }
  }

  const paymentTotalOrder = useMemo(() => {
    return (
      selectedProducts.reduce((result, product) => result + product.quantity * product.price, 0) + Number(shipping_fee)
    )
  }, [selectedProducts, shipping_fee])

  const quantityTotal = useMemo(() => {
    return selectedProducts.reduce((result, product) => result + product.quantity, 0)
  }, [selectedProducts])

  const handleCreateOrder = async () => {
    if (createOrderMutation.isPending) return
    try {
      const { price_total, cost_total, quantity_total, payment_total } = calculateTotalsFunc(
        selectedProducts,
        shipping_fee
      )
      const orderResult = await createOrderMutation.mutateAsync({
        customer_name,
        customer_phone,
        customer_address,
        quantity_total,
        price_total,
        cost_total,
        shipping_fee,
        payment_total,
        order_status: Number(order_status),
        order_date
      })
      const orderId = orderResult.payload.Id

      await Promise.all(
        selectedProducts.map((product) => {
          return createOrderItemMutation.mutateAsync({
            order_id: orderId,
            product_id: product.productId,
            product_name: product.name,
            quantity: product.quantity,
            cost: product.cost,
            price: product.price,
            cost_total: product.cost * product.quantity,
            price_total: product.price * product.quantity
          })
        })
      )
      toast({
        description: 'Tạo đơn hàng thành công!'
      })
      reset()
      setOpen(false)
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError
      })
    }
  }

  return (
    <Dialog
      onOpenChange={(value) => {
        if (!value) {
          reset()
        }
        setOpen(value)
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button size='sm' className='h-7 gap-1'>
          <PlusCircle className='h-3.5 w-3.5' />
          <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>Thêm đơn hàng</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px] max-h-screen overflow-auto'>
        <DialogHeader>
          <DialogTitle>Thêm đơn hàng</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form noValidate className='grid auto-rows-max items-start gap-4 md:gap-8' id='add-order-form'>
            <div className='grid gap-4 py-4'>
              <FormField
                control={form.control}
                name='customer_name'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='customer_name'>Tên khách hàng</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input id='customer_name' className='w-full' {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='customer_phone'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='customer_phone'>Số điện thoại</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input id='customer_phone' className='w-full' {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='customer_address'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='customer_address'>Địa chỉ</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input id='customer_address' className='w-full' {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='shipping_fee'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='shipping_fee'>Phí giao hàng</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input id='shipping_fee' className='w-full' {...field} type='number' />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='order_status'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='order_status'>Trạng thái</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Chọn trạng thái' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {OrderStatusValues.map((status) => (
                              <SelectItem key={status} value={status}>
                                {getVietnameseOrderStatus(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='order_date'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='order_date'>Ngày tạo</Label>
                      <div className='col-span-3 space-y-2'>
                        <Input
                          id='order_date'
                          type='datetime-local'
                          className='text-sm'
                          {...field}
                          // value={format(fromDate, 'yyyy-MM-dd HH:mm').replace(' ', 'T')}
                          // onChange={(event) => setFromDate(new Date(event.target.value))}
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        {productList.map((product) => (
          <div key={product.Id} className='flex gap-4'>
            <div className='flex-shrink-0 relative'>
              {product?.image ? (
                <Image
                  src={product?.image}
                  alt={product.name}
                  height={100}
                  width={100}
                  quality={100}
                  className='object-cover w-[80px] h-[80px] rounded-md'
                />
              ) : (
                <div className='flex items-center justify-center w-[80px] h-[80px] rounded-md bg-gray-200'>
                  <Package size={40} className='text-gray-500' />
                </div>
              )}
            </div>
            <div className='space-y-1'>
              <h3 className='text-sm'>{product.name}</h3>
              <p className='text-xs'>Giá bán: {formatCurrency(product.price)}</p>
              <p className='text-xs'>Giá vốn: {formatCurrency(product.cost)}</p>
            </div>
            <div className='flex-shrink-0 ml-auto flex justify-centeri items-center'>
              <Quantity
                onChange={(value) =>
                  handleProductQuantityChange({
                    productId: product.Id,
                    quantity: value,
                    name: product.name,
                    cost: product.cost,
                    price: product.price
                  })
                }
                value={
                  selectedProducts.find((selectedProduct) => selectedProduct.productId === product.Id)?.quantity ?? 0
                }
              />
            </div>
          </div>
        ))}
        <DialogFooter>
          <Button
            className='w-full justify-between'
            onClick={handleCreateOrder}
            disabled={selectedProducts.length === 0}
          >
            <span>
              Đặt hàng · {selectedProducts.length} sản phẩm(số lượng: {quantityTotal})
            </span>
            <span>{formatCurrency(paymentTotalOrder)}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
