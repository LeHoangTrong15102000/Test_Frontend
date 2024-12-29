'use client'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Default
// staleTime: 0
// gc: 5 phút (5 * 1000* 60)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})
// const AppContext = createContext({
//   isAuth: false,
//   role: undefined as RoleType | undefined,
//   setRole: (role?: RoleType | undefined) => {},
//   socket: undefined as Socket | undefined,
//   setSocket: (socket?: Socket | undefined) => {},
//   disconnectSocket: () => {}
// })

// type AppStoreType = {
//   isAuth: boolean
//   role: RoleType | undefined
//   setRole: (role?: RoleType | undefined) => void
//   socket: Socket | undefined
//   setSocket: (socket?: Socket | undefined) => void
//   disconnectSocket: () => void
// }

// export const useAppStore = create<AppStoreType>((set) => ({
//   isAuth: false,
//   role: undefined as RoleType | undefined,
//   setRole: (role?: RoleType | undefined) => {
//     set({ role, isAuth: Boolean(role) })
//     if (!role) {
//       removeTokensFromLocalStorage()
//     }
//   },
//   socket: undefined as Socket | undefined,
//   setSocket: (socket?: Socket | undefined) => set({ socket }),
//   disconnectSocket: () =>
//     set((state) => {
//       state.socket?.disconnect()
//       return { socket: undefined }
//     })
// }))

// export const useAppContext = () => {
//   return useContext(AppContext)
// }
export default function AppProvider({ children }: { children: React.ReactNode }) {
  // const disconnectSocket = useCallback(() => {
  //   socket?.disconnect()
  //   setSocket(undefined)
  // }, [socket, setSocket])

  // Các bạn nào mà dùng Next.js 15 và React 19 thì không cần dùng useCallback đoạn này cũng được
  // const setRole = useCallback((role?: RoleType | undefined) => {
  //   setRoleState(role)
  //   if (!role) {
  //     removeTokensFromLocalStorage()
  //   }
  // }, [])
  // const isAuth = Boolean(role)
  // Nếu mọi người dùng React 19 và Next.js 15 thì không cần AppContext.Provider, chỉ cần AppContext là đủ
  return (
    // <AppContext.Provider
    //   value={{ role, setRole, isAuth, socket, setSocket, disconnectSocket }}
    // >
    <QueryClientProvider client={queryClient}>
      {children}

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
    // </AppContext.Provider>
  )
}
