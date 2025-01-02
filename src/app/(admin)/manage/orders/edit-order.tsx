'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { formatCurrency, getVietnameseOrderStatus, handleErrorApi } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { useGetOrderQuery, useUpdateOrderMutation } from '@/queries/useOrder'
import { OrderStatus, OrderStatusValues } from '@/constants/type'
import { UpdateOrderBody, UpdateOrderBodyType } from '@/schemaValidations/order.schema'
import {
  useDeleteOrderItemMutation,
  useGetOrderItemListQuery,
  useUpdateOrderItemMutation
} from '@/queries/useOrderItem'
import { OrderItemListResType } from '@/schemaValidations/orderItem.schema'
import Quantity from './quantity'
import Image from 'next/image'
import { Package, Trash } from 'lucide-react'
import { format } from 'date-fns'
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import DialogAddProduct from './dialog-add-product'
import EditOrderSkeleton from './edit-order-skeleton'

type SelectedOrderItemType = OrderItemListResType['list'][0]
type OrderItemType = OrderItemListResType['list'][0]

function AlertDialogDeleteOrderItem({
  orderItemDelete,
  setOrderItemDelete,
  onDeleteOrderItem
}: {
  orderItemDelete: OrderItemType | null
  setOrderItemDelete: (value: OrderItemType | null) => void
  onDeleteOrderItem: (itemId: number) => void
}) {
  const { mutateAsync } = useDeleteOrderItemMutation()

  const deleteOrder = async () => {
    if (orderItemDelete) {
      try {
        await mutateAsync({ Id: orderItemDelete.Id })
        onDeleteOrderItem(orderItemDelete.Id)
        setOrderItemDelete(null)
        toast({
          title: 'Đã xoá sản phẩm thành công!'
        })
      } catch (error) {
        handleErrorApi({
          error
        })
      }
    }
  }
  return (
    <AlertDialog
      open={Boolean(orderItemDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setOrderItemDelete(null)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
          <AlertDialogDescription>
            Sản phẩm
            <span className='bg-foreground text-primary-foreground rounded px-1'>
              {orderItemDelete?.product_name}
            </span>{' '}
            của khách hàng sẽ bị xóa vĩnh viễn khỏi đơn hàng
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deleteOrder}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function EditOrder({
  id,
  setId,
  onSubmitSuccess
}: {
  id?: number | undefined
  setId: (value: number | undefined) => void
  onSubmitSuccess?: () => void
}) {
  const { data, isPending: orderIsPending } = useGetOrderQuery({ enabled: Boolean(id), id: id as number })
  const { data: orderItemList, isPending: orderItemListPending } = useGetOrderItemListQuery({
    enabled: Boolean(id),
    orderId: id
  })
  const orderItems = useMemo(() => orderItemList?.payload.list ?? [], [orderItemList])

  // const [isDialogAddProduct, setIsDialogAddProduct] = useState<boolean>(false)
  const [orderItemDelete, setOrderItemDelete] = useState<OrderItemType | null>(null)
  const [selectedOrderItems, setSelectedOrderItems] = useState<SelectedOrderItemType[]>(orderItems ?? [])

  const updateOrderMutation = useUpdateOrderMutation()
  const updateOrderItemMutation = useUpdateOrderItemMutation()
  const deleteOrderItemMutation = useDeleteOrderItemMutation()

  const form = useForm<UpdateOrderBodyType>({
    resolver: zodResolver(UpdateOrderBody),
    defaultValues: {
      customer_phone: '',
      customer_name: '',
      shipping_fee: 0,
      customer_address: '',
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

  useEffect(() => {
    if (orderItems) {
      const selectedOrderItems = orderItems.filter((item) => item.quantity > 0)
      setSelectedOrderItems(selectedOrderItems)
    }
  }, [orderItems])

  useEffect(() => {
    if (data) {
      const { customer_name, customer_phone, customer_address, shipping_fee, order_status, order_date } = data.payload
      // const formattedOrderDate = order_date ? new Date(order_date).toISOString().slice(0, 16) : ''
      form.reset({
        customer_name,
        customer_phone,
        customer_address,
        shipping_fee,
        order_status,
        order_date
      })
    }
  }, [data, form])

  const handleOrderItemQuantity = (itemId: number, quantity: number) => {
    // Khi mà quantity = 0 thì sẽ không xoá ra khỏi selectedOrderItems mà sẽ xoá khi mà UpdateOrder
    setSelectedOrderItems((prevOrderItems) => {
      const orderItemIndex = prevOrderItems.findIndex((item) => item.Id === itemId)
      if (orderItemIndex === -1) return prevOrderItems

      const newOrderItems = [...prevOrderItems]
      newOrderItems[orderItemIndex] = { ...newOrderItems[orderItemIndex], quantity }

      return newOrderItems
    })
  }

  const calculateTotalsFunc = (selectedOrderItems: SelectedOrderItemType[], shippingFee: number) => {
    const price_total = selectedOrderItems.reduce((result, product) => result + product.quantity * product.price, 0)
    const cost_total = selectedOrderItems.reduce((result, product) => result + product.quantity * product.cost, 0)
    const quantity_total = selectedOrderItems.reduce((result, product) => result + product.quantity, 0)
    const payment_total = price_total + Number(shippingFee)

    return { price_total, cost_total, quantity_total, payment_total }
  }

  const paymentTotalOrder = useMemo(() => {
    return (
      selectedOrderItems.reduce((result, product) => result + product.quantity * product.price, 0) +
      Number(shipping_fee)
    )
  }, [selectedOrderItems, shipping_fee])

  const quantityTotal = useMemo(() => {
    return selectedOrderItems.reduce((result, product) => result + product.quantity, 0)
  }, [selectedOrderItems])

  const handleDeleteOrderItem = async (orderItemId: number) => {
    setSelectedOrderItems((prevOrderItems) => prevOrderItems.filter((item) => item.Id !== orderItemId))
  }

  const handleUpdateOrder = async () => {
    if (updateOrderMutation.isPending) return
    try {
      const { price_total, cost_total, quantity_total, payment_total } = calculateTotalsFunc(
        selectedOrderItems,
        shipping_fee as number
      )

      await updateOrderMutation.mutateAsync({
        Id: id as number,
        customer_name,
        customer_phone,
        customer_address,
        shipping_fee,
        price_total,
        cost_total,
        quantity_total,
        payment_total,
        order_status: Number(order_status),
        order_date: format(new Date(order_date as string), 'yyyy-MM-dd')
      })

      await Promise.all(
        selectedOrderItems.map(async (item) => {
          if (item.quantity === 0 && item.Id) {
            return deleteOrderItemMutation.mutateAsync({ Id: item.Id })
          } else {
            return updateOrderItemMutation.mutateAsync({
              Id: item.Id,
              quantity: item.quantity,
              price_total: item.price * item.quantity,
              cost_total: item.cost * item.quantity
            })
          }
        })
      )
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
    <>
      <AlertDialogDeleteOrderItem
        orderItemDelete={orderItemDelete}
        setOrderItemDelete={setOrderItemDelete}
        onDeleteOrderItem={handleDeleteOrderItem}
      />

      {/* Dialog Add Product */}

      <Dialog
        open={Boolean(id)}
        onOpenChange={(value) => {
          if (!value) {
            reset()
          }
        }}
      >
        <DialogContent className='sm:max-w-[600px] max-h-screen overflow-auto'>
          {orderIsPending || orderItemListPending ? (
            <EditOrderSkeleton />
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Cập nhật đơn hàng</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form noValidate className='grid auto-rows-max items-start gap-4 md:gap-8' id='edit-order-form'>
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
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                              <Label htmlFor='order_status'>Trạng thái</Label>
                              <div className='col-span-3 w-full space-y-2'>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={String(field.value)}
                                  value={String(field.value) ?? OrderStatus.NEW}
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
                                </Select>
                                {/* <select
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
                            </select> */}
                              </div>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )
                      }}
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
                                value={
                                  field.value ? format(new Date(field.value), 'yyyy-MM-dd HH:mm').replace(' ', 'T') : ''
                                }
                                onChange={field.onChange}
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
              {/* Cho thêm skeleton sản phẩmm ở đây */}
              {orderItems.map((item) => (
                <div key={item.Id} className='flex gap-4'>
                  <div className='flex-shrink-0 relative'>
                    {item?.image ? (
                      <Image
                        src={item?.image}
                        alt={item.product_name}
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
                    <h3 className='text-sm'>{item.product_name}</h3>
                    <p className='text-xs'>Giá bán: {formatCurrency(item.price)}</p>
                    <p className='text-xs'>Giá vốn: {formatCurrency(item.cost)}</p>
                  </div>
                  <div className='flex-shrink-0 ml-auto flex justify-center items-center'>
                    <Quantity
                      onChange={(value) => handleOrderItemQuantity(item.Id, value)}
                      value={
                        selectedOrderItems.find((selectedOrderItems) => selectedOrderItems.Id === item.Id)?.quantity ??
                        0
                      }
                    />
                  </div>
                  <div className='flex-shrink-0 flex justify-center items-center'>
                    <Button variant='ghost' size='icon' onClick={() => setOrderItemDelete(item)}>
                      <Trash className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
              <DialogAddProduct
                orderId={id as number}
                onAddProduct={() => {
                  console.log('Add Product thành công')
                }}
                selectedOrderItems={selectedOrderItems}
                setSelectedOrderItems={setSelectedOrderItems}
              />
              <DialogFooter>
                <Button className='w-full justify-between' onClick={handleUpdateOrder}>
                  <span>
                    Cập nhật · {selectedOrderItems.length} sản phẩm(số lượng: {quantityTotal})
                  </span>
                  <span>{formatCurrency(paymentTotalOrder)}</span>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
