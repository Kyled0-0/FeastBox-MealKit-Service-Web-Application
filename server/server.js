import 'dotenv/config'
import { createApp } from './index.js'
import { logger } from './logger.js'

const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'CLIENT_URL']
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required env var: ${key}`)
}

const app = createApp()
const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => logger.info({ port: PORT }, 'API listening'))
