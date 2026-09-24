import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'

export function useShippingRate(): number | null {
  const { token } = useAuth()
  const [rate, setRate] = useState<number | null>(null)

  useEffect(() => {
    api
      .get<{ data: { flatRatePerStore: number } }>('/api/orders/shipping-rate', token)
      .then((res) => setRate(res.data.flatRatePerStore))
      .catch(() => setRate(0))
  }, [token])

  return rate
}
