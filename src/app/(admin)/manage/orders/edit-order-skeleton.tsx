import { Skeleton } from '@/components/ui/skeleton'

export default function EditOrderSkeleton() {
  return (
    <div className='grid gap-4'>
      {/* phần Form */}
      <div className='grid gap-4 py-4'>
        {/* Tên khách hàng */}
        <div className='grid grid-cols-4 items-center gap-4'>
          <Skeleton className='h-4 w-[120px]' />
          <div className='col-span-3'>
            <Skeleton className='h-10 w-full' />
          </div>
        </div>
        {/* Số điện thoại */}
        <div className='grid grid-cols-4 items-center gap-4'>
          <Skeleton className='h-4 w-[100px]' />
          <div className='col-span-3'>
            <Skeleton className='h-10 w-full' />
          </div>
        </div>
        {/* Địa chỉ */}
        <div className='grid grid-cols-4 items-center gap-4'>
          <Skeleton className='h-4 w-[60px]' />
          <div className='col-span-3'>
            <Skeleton className='h-10 w-full' />
          </div>
        </div>
        {/* Phí giao hàng */}
        <div className='grid grid-cols-4 items-center gap-4'>
          <Skeleton className='h-4 w-[80px]' />
          <div className='col-span-3'>
            <Skeleton className='h-10 w-full' />
          </div>
        </div>
        {/* Trạng thái */}
        <div className='grid grid-cols-4 items-center gap-4'>
          <Skeleton className='h-4 w-[80px]' />
          <div className='col-span-3'>
            <Skeleton className='h-10 w-full' />
          </div>
        </div>
        {/* Ngày tạo */}
        <div className='grid grid-cols-4 items-center gap-4'>
          <Skeleton className='h-4 w-[60px]' />
          <div className='col-span-3'>
            <Skeleton className='h-10 w-full' />
          </div>
        </div>
      </div>

      {/* danh sách sản phẩm */}
      <div className='space-y-3'>
        {[1, 2, 3].map((_, idx) => (
          <div key={idx} className='flex gap-4'>
            <Skeleton className='w-[80px] h-[80px] rounded-md' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-1/2' />
              <Skeleton className='h-4 w-1/3' />
              <Skeleton className='h-4 w-1/3' />
            </div>
            <Skeleton className='w-[60px] h-10' />
            <Skeleton className='w-10 h-10' />
          </div>
        ))}
      </div>
      {/* Button footer */}
      <div className='mt-4'>
        <Skeleton className='h-10 w-full' />
      </div>
    </div>
  )
}
