export interface AppNotification {
  _id: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

export interface Session {
  id: string
  device: string
  ipAddress: string | null
  lastActiveAt: string
  createdAt: string
  isCurrent: boolean
}
