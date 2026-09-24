import cron from 'node-cron'
import { autoCompleteOverdueOrders } from '../controllers/order.controller.js'

/**
 * Jalan tiap 15 menit, mengecek pesanan berstatus 'dikirim' yang sudah lewat 24 jam
 * tanpa konfirmasi pembeli, lalu menandainya 'selesai' otomatis — terlepas dari apakah
 * ada yang sedang membuka halaman Pesanan atau tidak (beda dari pengecekan lama yang
 * cuma jalan saat halaman dibuka).
 */
export function startAutoCompleteOrdersJob() {
  cron.schedule('*/15 * * * *', async () => {
    try {
      await autoCompleteOverdueOrders()
    } catch (error) {
      console.error('❌ Gagal menjalankan job auto-selesai pesanan:', error)
    }
  })
  console.log('⏰ Job auto-selesai pesanan aktif (jalan tiap 15 menit)')
}
