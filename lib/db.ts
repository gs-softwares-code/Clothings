import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// On Vercel (or read-only serverless environments), the root directory is read-only.
// Copy the bundled SQLite database to /tmp so reads and writes work seamlessly.
if (process.env.VERCEL) {
  const currentDbUrl = process.env.DATABASE_URL || ''
  if (!currentDbUrl || currentDbUrl.startsWith('file:')) {
    const tmpDbDir = '/tmp'
    const tmpDbPath = path.join(tmpDbDir, 'dev.db')
    const sourceDbPath = path.join(process.cwd(), 'prisma', 'dev.db')

    if (!fs.existsSync(tmpDbPath) && fs.existsSync(sourceDbPath)) {
      try {
        fs.copyFileSync(sourceDbPath, tmpDbPath)
      } catch (err) {
        console.error('Error copying SQLite database to /tmp:', err)
      }
    }

    if (fs.existsSync(tmpDbPath)) {
      process.env.DATABASE_URL = `file:${tmpDbPath}`
    }
  }
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const db = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db
