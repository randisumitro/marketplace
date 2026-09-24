import { useEffect, useState } from 'react'

function formatRemaining(ms: number): string {
  if (ms <= 0) return 'sebentar lagi'
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) return `${hours}j ${minutes}m`
  return `${minutes}m`
}

export function CountdownTimer({ deadline }: { deadline: Date }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(interval)
  }, [])

  const remaining = deadline.getTime() - now
  if (remaining <= 0) return <span>memproses...</span>

  return <span>{formatRemaining(remaining)}</span>
}
