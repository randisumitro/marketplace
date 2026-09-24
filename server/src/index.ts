import { createApp } from './app.js'
import { connectDB } from './config/db.js'
import { env } from './config/env.js'
import { startAutoCompleteOrdersJob } from './jobs/autoCompleteOrders.job.js'

async function bootstrap() {
  await connectDB()

  const app = createApp()

  app.listen(env.port, () => {
    console.log(`\n🚀 OneShop API berjalan di http://localhost:${env.port}`)
    console.log(`   Mode: ${env.nodeEnv}`)
    console.log(`   Health check: http://localhost:${env.port}/api/health\n`)
  })

  startAutoCompleteOrdersJob()
}

bootstrap().catch((error) => {
  console.error('❌ Gagal menjalankan server:', error)
  process.exit(1)
})
