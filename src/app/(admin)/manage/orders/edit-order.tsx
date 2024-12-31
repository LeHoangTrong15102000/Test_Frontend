'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { getVietnameseOrderStatus, handleErrorApi } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { useGetOrderQuery, useUpdateOrderMutation } from '@/queries/useOrder'
import { OrderStatus, OrderStatusValues } from '@/constants/type'
import { UpdateOrderBody, UpdateOrderBodyType } from '@/schemaValidations/order.schema'
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SelectItem } from '@radix-ui/react-select'
import { useGetOrderItemListQuery } from '@/queries/useOrderItem'

export default function EditOrder({
  id,
  setId,
  onSubmitSuccess
}: {
  id?: number | undefined
  setId: (value: number | undefined) => void
  onSubmitSuccess?: () => void
}) {
  const updateOrderMutation = useUpdateOrderMutation()
  const { data } = useGetOrderQuery({ enabled: Boolean(id), id: id as number })
  // const { data: orderItemList } = useGetOrderItemListQuery({ enabled: Boolean(id), orderId: id })
  const form = useForm<UpdateOrderBodyType>({
    resolver: zodResolver(UpdateOrderBody),
    defaultValues: {
      customer_phone: '',
      customer_name: '',
      quantity_total: 0,
      cost_total: 0,
      price_total: 0,
      shipping_fee: 0,
      payment_total: 0,
      customer_address: '',
      order_status: parseInt(OrderStatus.NEW, 10)
      // order_status: OrderStatus.NEW
    }
  })
  // const order_status = form.watch('customer_name')?.toString()

  useEffect(() => {
    if (data) {
      const {
        customer_name,
        customer_phone,
        customer_address,
        quantity_total,
        price_total,
        cost_total,
        shipping_fee,
        payment_total,
        order_status
      } = data.payload

      form.reset({
        customer_name,
        customer_phone,
        customer_address,
        quantity_total,
        price_total,
        cost_total,
        shipping_fee,
        payment_total,
        order_status
      })
    }
  }, [data, form])

  const onSubmit = async (values: UpdateOrderBodyType) => {
    if (updateOrderMutation.isPending) return
    try {
      let body: UpdateOrderBodyType & { Id: number } = {
        Id: id as number,
        ...values,
        order_status: Number(values.order_status)
        // parseInt cái giá trị order_status lại thành số trước khi gửi lên server
      }
      await updateOrderMutation.mutateAsync(body)
      toast({
        description: 'Cập nhật sản phẩm thành công!'
      })
      reset()
      onSubmitSuccess && onSubmitSuccess()
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError
      })
    }
  }

  const reset = () => {
    setId(undefined)
    form.reset()
  }

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) {
          reset()
        }
      }}
    >
      <DialogContent className='sm:max-w-[600px] max-h-screen overflow-auto'>
        <DialogHeader>
          <DialogTitle>Cập nhật đơn hàng</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className='grid auto-rows-max items-start gap-4 md:gap-8'
            id='edit-order-form'
            onSubmit={form.handleSubmit(onSubmit, console.log)}
          >
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
                name='quantity_total'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='quantity_total'>Tổng số lượng</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input id='quantity_total' className='w-full' {...field} type='number' />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='cost_total'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='cost_total'>Tổng giá vốn</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input id='cost_total' className='w-full' {...field} type='number' />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='price_total'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='price_total'>Tổng giá bán</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input id='price_total' className='w-full' {...field} type='number' />
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
                name='payment_total'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='payment_total'>Tổng thanh toán</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input id='payment_total' className='w-full' {...field} type='number' />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='order_status'
                render={({ field }) => {
                  return (
                    <FormItem>
                      <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                        <Label htmlFor='order_status'>Trạng thái</Label>
                        <div className='col-span-3 w-full space-y-2'>
                          {/* <Select
                            onValueChange={field.onChange}
                            defaultValue={String(field.value)}
                            value={field.value?.toString()}
                          >
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
                          </Select> */}
                          <select
                            id='order_status'
                            className='w-full rounded-md border p-2 text-sm bg-background text-foreground border-border dark:bg-[#020817] dark:text-gray-100 dark:border-gray-700'
                            value={field.value?.toString() || OrderStatus.NEW}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                          >
                            {OrderStatusValues.map((status) => (
                              <option key={status} value={status}>
                                {getVietnameseOrderStatus(status)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <FormMessage />
                      </div>
                    </FormItem>
                  )
                }}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button className='w-full' type='submit' form='edit-order-form'>
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
