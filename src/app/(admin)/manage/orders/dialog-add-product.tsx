import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import AutoPagination from '@/components/auto-pagination'
import { useEffect, useMemo, useState } from 'react'
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
import { formatCurrency, formatDateTimeToLocaleString, simpleMatchText } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { ProductListResType } from '@/schemaValidations/product.schema'
import { useGetProductListQuery } from '@/queries/useProduct'
import { useCreateOrderItemMutation, useUpdateOrderItemMutation } from '@/queries/useOrderItem'
import { toast } from '@/components/ui/use-toast'
import { OrderItemListResType } from '@/schemaValidations/orderItem.schema'

type ProductItemResType = ProductListResType['list'][0]
type OrderItemType = OrderItemListResType['list'][0]

export const columns: ColumnDef<ProductItemResType>[] = [
  {
    accessorKey: 'name',
    header: 'Tên sản phẩm',
    cell: ({ row }) => (
      <div className='capitalize'>
        {row.getValue('name')} | (#{row.original.Id})
      </div>
    ),
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true
      // + String(row.original.Id)
      return simpleMatchText(row.original.name, String(filterValue))
    }
  },
  {
    accessorKey: 'price',
    header: 'Giá bán',
    cell: ({ row }) => <div className='capitalize'>{formatCurrency(row.getValue('price'))}</div>,
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true
      return simpleMatchText(String(row.original.price), String(filterValue))
    }
  },
  {
    accessorKey: 'cost',
    header: 'Giá vốn',
    cell: ({ row }) => <div className='capitalize'>{formatCurrency(row.getValue('cost'))}</div>,
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true
      return simpleMatchText(String(row.original.cost), String(filterValue))
    }
  },
  {
    accessorKey: 'CreatedAt',
    header: () => <div>Ngày tạo</div>,
    cell: ({ row }) => (
      <div className='flex items-center space-x-4 text-sm'>
        {formatDateTimeToLocaleString(row.getValue('CreatedAt'))}
      </div>
    )
  }
]

const PAGE_SIZE = 5

export default function DialogAddProduct({
  onAddProduct,
  orderId,
  setSelectedOrderItems,
  selectedOrderItems
}: {
  onAddProduct: () => void
  orderId: number
  setSelectedOrderItems: React.Dispatch<React.SetStateAction<OrderItemType[]>>
  selectedOrderItems: OrderItemType[]
}) {
  const [open, setOpen] = useState(false)

  const productListQuery = useGetProductListQuery()
  const data = productListQuery.data?.payload.list ?? []
  // const { data: orderItemList, isPending: orderItemListPending } = useGetOrderItemListQuery({
  //   enabled: Boolean(orderId),
  //   orderId: orderId
  // })
  // const orderItems = useMemo(() => orderItemList?.payload.list ?? [], [orderItemList])

  const createOrderItemMutation = useCreateOrderItemMutation()
  const updateOrderItemMutation = useUpdateOrderItemMutation()

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex: 0, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
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
      pageIndex: 0,
      pageSize: PAGE_SIZE
    })
  }, [table])

  const checkProductExists = (productId: number, orderItems: OrderItemType[]) => {
    return orderItems.find((item) => item.product_id === productId)
  }

  const handleAddProduct = async (product: ProductItemResType) => {
    if (!orderId) return

    const existingItem = checkProductExists(product.Id, selectedOrderItems)

    if (existingItem) {
      // await updateOrderItemMutation.mutateAsync({
      //   Id: existingItem.Id,
      //   quantity: existingItem.quantity + 1,
      //   cost_total: existingItem.cost_total + product.cost,
      //   price_total: existingItem.price_total + product.price
      // })
      setSelectedOrderItems((prevOrderItems: OrderItemType[]) => {
        const orderItemIndex = prevOrderItems.findIndex((item) => item.Id === existingItem.Id)
        if (orderItemIndex === -1) return prevOrderItems

        const newOrderItems = [...prevOrderItems]
        newOrderItems[orderItemIndex] = {
          ...newOrderItems[orderItemIndex],
          quantity: existingItem.quantity + 1,
          cost_total: existingItem.cost_total + product.cost,
          price_total: existingItem.price
        }

        return newOrderItems
      })
      toast({
        description: `Đã cập nhật số lượng sản phẩm ${product.name} trong đơn hàng!`
      })
    } else {
      await createOrderItemMutation.mutateAsync({
        order_id: orderId,
        product_id: product.Id,
        product_name: product.name,
        quantity: 1,
        cost: product.cost,
        price: product.price,
        cost_total: product.cost * 1,
        price_total: product.price * 1
      })
      toast({
        description: `Đã thêm sản phẩm ${product.name} vào đơn hàng!`
      })
    }

    onAddProduct()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>Chọn sản phẩm</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[900px] max-h-full overflow-auto'>
        <DialogHeader>
          <DialogTitle>Chọn sản phẩm</DialogTitle>
        </DialogHeader>
        <div>
          <div className='w-full'>
            {/* <div className='flex flex-wrap gap-2'>
              <div className='flex items-center'>
                <span className='mr-2'>Từ</span>
                <Input
                  type='datetime-local'
                  placeholder='Từ ngày'
                  className='text-sm'
                  value={format(fromDate, 'yyyy-MM-dd HH:mm').replace(' ', 'T')}
                  onChange={(event) => setFromDate(new Date(event.target.value))}
                />
              </div>
              <div className='flex items-center'>
                <span className='mr-2'>Đến</span>
                <Input
                  type='datetime-local'
                  placeholder='Đến ngày'
                  value={format(toDate, 'yyyy-MM-dd HH:mm').replace(' ', 'T')}
                  onChange={(event) => setToDate(new Date(event.target.value))}
                />
              </div>
              <Button className='' variant={'outline'} onClick={resetDateFilter}>
                Reset
              </Button>
            </div> */}
            <div className='flex items-center py-4 gap-2'>
              <Input
                placeholder='Tên sản phẩm'
                value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                className='w-[170px]'
              />
              {/* <Input
                placeholder='Số bàn'
                value={(table.getColumn('tableNumber')?.getFilterValue() as string) ?? ''}
                onChange={(event) => table.getColumn('tableNumber')?.setFilterValue(event.target.value)}
                className='w-[80px]'
              /> */}
            </div>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        onClick={() => {
                          handleAddProduct(row.original)
                        }}
                        className='cursor-pointer'
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
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
                Hiển thị <strong>{table.getPaginationRowModel().rows.length}</strong> trong{' '}
                <strong>{data.length}</strong> kết quả
              </div>
              <div>
                <AutoPagination
                  page={table.getState().pagination.pageIndex + 1}
                  pageSize={table.getPageCount()}
                  onClick={(pageNumber) =>
                    table.setPagination({
                      pageIndex: pageNumber - 1,
                      pageSize: PAGE_SIZE
                    })
                  }
                  isLink={false}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
