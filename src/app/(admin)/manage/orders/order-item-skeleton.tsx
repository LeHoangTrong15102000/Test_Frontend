import { Skeleton } from '@/components/ui/skeleton'

interface OrderItemSkeletonProps {
  length?: number
}

/**
 * Component hiển thị các hàng skeleton mô phỏng danh sách order items
 */
export default function OrderItemSkeleton({ length = 1 }: OrderItemSkeletonProps) {
  // length = số dòng skeleton muốn hiển thị (mặc định = 1)
  return (
    <div className='space-y-4'>
      {Array.from({ length }).map((_, idx) => (
        <div key={idx} className='flex items-center gap-4'>
          {/* Cột ảnh sản phẩm */}
          <Skeleton className='w-[80px] h-[80px] rounded-md flex-shrink-0' />

          {/* Cột thông tin sản phẩm (tên, giá bán, giá vốn) */}
          <div className='flex-1 space-y-2'>
            <Skeleton className='h-4 w-2/3' />
            <Skeleton className='h-4 w-1/2' />
            <Skeleton className='h-4 w-1/3' />
          </div>

          {/* Cột Quantity */}
          <div className='flex-shrink-0 flex items-center'>
            <Skeleton className='w-14 h-10' />
          </div>

          {/* Cột nút xóa */}
          <div className='flex-shrink-0 flex items-center'>
            <Skeleton className='w-10 h-10' />
          </div>
        </div>
      ))}
    </div>
  )
}
