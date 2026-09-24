import { useLayoutEffect } from 'react'

/**
 * Mengunci scroll body selama komponen (biasanya modal) aktif.
 * Memakai teknik "fixed body" — bukan cuma overflow:hidden — supaya elemen
 * position:fixed di dalamnya selalu menutupi viewport dengan benar, bahkan
 * kalau modal dibuka saat halaman sedang di-scroll.
 */
export function useScrollLock() {
  useLayoutEffect(() => {
    const scrollY = window.scrollY
    const { body } = document

    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'

    return () => {
      body.style.position = ''
      body.style.top = ''
      body.style.left = ''
      body.style.right = ''
      window.scrollTo(0, scrollY)
    }
  }, [])
}
