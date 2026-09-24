import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import type { AppNotification } from '@/types/notification'

const POLL_INTERVAL_MS = 30_000

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'baru saja'
  if (minutes < 60) return `${minutes}m lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}j lalu`
  const days = Math.floor(hours / 24)
  return `${days}h lalu`
}

export function NotificationBell() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unread, setUnread] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const fetchUnread = () => {
    api
      .get<{ data: { count: number } }>('/api/notifications/unread-count', token)
      .then((res) => setUnread(res.data.count))
      .catch(() => {})
  }

  useEffect(() => {
    fetchUnread()
    const interval = setInterval(fetchUnread, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    if (!open) return
    api
      .get<{ data: AppNotification[] }>('/api/notifications', token)
      .then((res) => setNotifications(res.data))
      .catch(() => {})

    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open, token])

  async function handleItemClick(n: AppNotification) {
    if (!n.isRead) {
      await api.put(`/api/notifications/${n._id}/read`, undefined, token)
      setNotifications((prev) => prev.map((item) => (item._id === n._id ? { ...item, isRead: true } : item)))
      setUnread((prev) => Math.max(0, prev - 1))
    }
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  async function handleMarkAllRead() {
    await api.put('/api/notifications/read-all', undefined, token)
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnread(0)
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifikasi"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink/70 hover:bg-paper-surface dark:text-paper-surface/70 dark:hover:bg-paper-dark-surface"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald px-1 text-[10px] font-semibold text-white dark:bg-gold dark:text-ink">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-ink/10 bg-paper shadow-xl dark:border-paper-surface/10 dark:bg-paper-dark-surface"
        >
          <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3 dark:border-paper-surface/10">
            <p className="text-sm font-semibold">Notifikasi</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-ink/50 hover:text-ink dark:text-paper-surface/50 dark:hover:text-paper-surface"
              >
                <CheckCheck size={13} />
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink/45 dark:text-paper-surface/45">
                Belum ada notifikasi
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  type="button"
                  onClick={() => handleItemClick(n)}
                  className={`flex w-full flex-col gap-0.5 border-b border-ink/5 px-4 py-3 text-left last:border-0 hover:bg-paper-surface dark:border-paper-surface/5 dark:hover:bg-paper-dark ${
                    !n.isRead ? 'bg-emerald/5 dark:bg-gold/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {!n.isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald dark:bg-gold" />}
                    <p className="text-sm font-medium">{n.title}</p>
                  </div>
                  <p className="text-xs text-ink/60 dark:text-paper-surface/60">{n.message}</p>
                  <p className="text-[11px] text-ink/40 dark:text-paper-surface/40">{timeAgo(n.createdAt)}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
