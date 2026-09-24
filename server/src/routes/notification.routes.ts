import { Router } from 'express'
import { listNotifications, unreadCount, markRead, markAllRead } from '../controllers/notification.controller.js'
import { verifyToken } from '../middleware/auth.js'

export const notificationRouter = Router()

notificationRouter.use(verifyToken)
notificationRouter.get('/', listNotifications)
notificationRouter.get('/unread-count', unreadCount)
notificationRouter.put('/read-all', markAllRead)
notificationRouter.put('/:id/read', markRead)
