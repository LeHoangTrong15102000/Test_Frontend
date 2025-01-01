'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import DOMPurify from 'dompurify'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createContext, useContext, useEffect, useState } from 'react'
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
import { formatCurrency, formatDateTimeToLocaleString, getVietnameseOrderStatus, handleErrorApi } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'
import AutoPagination from '@/components/auto-pagination'
import { toast } from '@/components/ui/use-toast'
import EditOrder from './edit-order'
import AddOrder from './add-order'
import { OrderListResType } from '@/schemaValidations/order.schema'
import { useDeleteOrderMutation, useGetOrderListQuery } from '@/queries/useOrder'
import { OrderStatus } from '@/constants/type'
import { useGetOrderItemListQuery } from '@/queries/useOrderItem'

type OrderItem = OrderListResType['list'][0]

const OrderTableContext = createContext<{
  setOrderIdEdit: (value: number) => void
  orderIdEdit: number | undefined
  orderDelete: OrderItem | null
  setOrderDelete: (value: OrderItem | null) => void
}>({
  setOrderIdEdit: (value: number | undefined) => {},
  orderIdEdit: undefined,
  orderDelete: null,
  setOrderDelete: (value: OrderItem | null) => {}
})

export const columns: ColumnDef<OrderItem>[] = [
  {
    accessorKey: 'Id',
    header: 'ID'
  },
  {
    accessorKey: 'customer_name',
    header: 'Tên',
    cell: ({ row }) => <div className='capitalize'>{row.getValue('customer_name')}</div>
  },
  {
    accessorKey: 'customer_phone',
    header: 'Số điện thoại',
    cell: ({ row }) => <div className='capitalize'>{row.getValue('customer_phone')}</div>
  },
  {
    accessorKey: 'customer_address',
    header: 'Địa chỉ',
    cell: ({ row }) => <div className='capitalize'>{row.getValue('customer_address')}</div>
  },
  {
    accessorKey: 'quantity_total',
    header: 'Tổng số lượng',
    cell: ({ row }) => <div className='capitalize'>{row.getValue('quantity_total')}</div>
  },
  {
    accessorKey: 'cost_total',
    header: 'Tổng giá vốn',
    cell: ({ row }) => <div className='capitalize'>{formatCurrency(row.getValue('cost_total'))}</div>
  },
  {
    accessorKey: 'price_total',
    header: 'Tổng giá bán',
    cell: ({ row }) => <div className='capitalize'>{formatCurrency(row.getValue('price_total'))}</div>
  },
  {
    accessorKey: 'shipping_fee',
    header: 'Phí giao hàng',
    cell: ({ row }) => <div className='capitalize'>{formatCurrency(row.getValue('shipping_fee'))}</div>
  },
  {
    accessorKey: 'payment_total',
    header: 'Tổng thanh toán',
    cell: ({ row }) => <div className='capitalize'>{formatCurrency(row.getValue('payment_total'))}</div>
  },
  {
    accessorKey: 'order_status',
    header: 'Trạng thái',
    cell: ({ row }) => {
      const statusNumber = row.getValue('order_status') as number
      const statusString = String(statusNumber) as (typeof OrderStatus)[keyof typeof OrderStatus]
      return <div>{getVietnameseOrderStatus(statusString)}</div>
    }
  },
  {
    accessorKey: 'order_date',
    header: () => <div>Ngày tạo/Cập nhật</div>,
    cell: ({ row }) => (
      <div className='space-y-2 text-sm'>
        <div className='flex items-center space-x-4'>{formatDateTimeToLocaleString(row.getValue('order_date'))}</div>
        <div className='flex items-center space-x-4'>
          {row.original.UpdatedAt ? formatDateTimeToLocaleString(row.original.UpdatedAt) : undefined}
        </div>
      </div>
    )
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({ row }) {
      const { setOrderIdEdit, setOrderDelete } = useContext(OrderTableContext)
      const openEditOrder = () => {
        setOrderIdEdit(row.original.Id)
      }

      const openDeleteOrder = () => {
        setOrderDelete(row.original)
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <DotsHorizontalIcon className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={openEditOrder}>Sửa</DropdownMenuItem>
            <DropdownMenuItem onClick={openDeleteOrder}>Xóa</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

function AlertDialogDeleteOrder({
  orderDelete,
  setOrderDelete
}: {
  orderDelete: OrderItem | null
  setOrderDelete: (value: OrderItem | null) => void
}) {
  const { mutateAsync } = useDeleteOrderMutation()

  const deleteOrder = async () => {
    if (orderDelete) {
      try {
        await mutateAsync({ Id: orderDelete.Id })
        setOrderDelete(null)
        toast({
          title: 'Đã xoá đơn hàng thành công!'
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
      open={Boolean(orderDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setOrderDelete(null)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa đơn hàng?</AlertDialogTitle>
          <AlertDialogDescription>
            Đơn hàng số<span className='bg-foreground text-primary-foreground rounded px-1'>{orderDelete?.Id}</span> của
            khách
            <span className='bg-foreground text-primary-foreground rounded px-1'>{orderDelete?.customer_name}</span> sẽ
            bị xóa vĩnh viễn
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

// Số lượng item trên 1 trang
const PAGE_SIZE = 10
export default function OrderTable() {
  const searchParam = useSearchParams()
  const page = searchParam.get('page') ? Number(searchParam.get('page')) : 1
  const pageIndex = page - 1
  const [orderIdEdit, setOrderIdEdit] = useState<number | undefined>()
  const [orderDelete, setOrderDelete] = useState<OrderItem | null>(null)
  const orderListQuery = useGetOrderListQuery()
  const data = orderListQuery.data?.payload.list ?? []
  // const { data: orderItemList } = useGetOrderItemListQuery({ enabled: true })
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE //default page size
  })

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    }
  })

  useEffect(() => {
    table.setPagination({
      pageIndex,
      pageSize: PAGE_SIZE
    })
  }, [table, pageIndex])

  return (
    <OrderTableContext.Provider value={{ orderIdEdit, setOrderIdEdit, orderDelete, setOrderDelete }}>
      <div className='w-full'>
        <EditOrder id={orderIdEdit} setId={setOrderIdEdit} />
        <AlertDialogDeleteOrder orderDelete={orderDelete} setOrderDelete={setOrderDelete} />
        <div className='flex items-center py-4'>
          <Input
            placeholder='Lọc tên khách hàng'
            value={(table.getColumn('customer_name')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('customer_name')?.setFilterValue(event.target.value)}
            className='max-w-sm'
          />
          <div className='ml-auto flex items-center gap-2'>
            <AddOrder />
          </div>
        </div>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className='h-24 text-center'>
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className='flex items-center justify-end space-x-2 py-4'>
          <div className='text-xs text-muted-foreground py-4 flex-1 '>
            Hiển thị <strong>{table.getPaginationRowModel().rows.length}</strong> trong <strong>{data.length}</strong>{' '}
            kết quả
          </div>
          <div>
            <AutoPagination
              page={table.getState().pagination.pageIndex + 1}
              pageSize={table.getPageCount()}
              pathname='/manage/orders'
            />
          </div>
        </div>
      </div>
    </OrderTableContext.Provider>
  )
}
