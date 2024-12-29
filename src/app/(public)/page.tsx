import Link from 'next/link'

const page = () => {
  return (
    <div>
      Home Page
      <div>
        <Link href='/manage/products'>Nhấn vào để đi đến trang quản lí sản phấm</Link>
      </div>
    </div>
  )
}

export default page
