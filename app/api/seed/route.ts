import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

export async function GET(): Promise<NextResponse> {
  const users = [
    { id: '1', name: 'Ana Novak', email: 'ana@example.com' },
    { id: '2', name: 'Miha Kovač', email: 'miha@example.com' },
    { id: '3', name: 'Jana Horvat', email: 'jana@example.com' },
  ]

  for (const user of users) {
    await redis.hset('users', { [user.id]: JSON.stringify(user) })
  }

  return NextResponse.json({ success: true, count: users.length })
}