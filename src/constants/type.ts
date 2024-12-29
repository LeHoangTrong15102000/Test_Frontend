export const DishStatus = {
  Available: 'Available',
  Unavailable: 'Unavailable',
  Hidden: 'Hidden'
} as const

export const DishStatusValues = [DishStatus.Available, DishStatus.Unavailable, DishStatus.Hidden] as const

export const TableStatus = {
  Available: 'Available',
  Hidden: 'Hidden',
  Reserved: 'Reserved'
} as const

export const TableStatusValues = [TableStatus.Available, TableStatus.Hidden, TableStatus.Reserved] as const

export const OrderStatus = {
  NEW: '1',
  IN_DELIVERY: '2',
  DELIVERED: '3',
  RETURNED: '4'
} as const

export const OrderStatusValues = [
  OrderStatus.NEW,
  OrderStatus.IN_DELIVERY,
  OrderStatus.DELIVERED,
  OrderStatus.RETURNED
] as const

export const ManagerRoom = 'manager' as const
