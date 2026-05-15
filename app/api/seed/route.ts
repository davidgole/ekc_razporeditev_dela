import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

export async function GET(): Promise<NextResponse> {
  const users = [
    { id: '4', name: 'Neira', email: 'neira.duric.student@gov.si' },
    { id: '5', name: 'Marko', email: 'marko.trsan@gov.si' },
    { id: '6', name: 'Tadej', email: 'tadej.berlec@gov.si' },
    { id: '7', name: 'Kristina', email: 'kristina.cvijanovic.student@gov.si' },
    { id: '8', name: 'David', email: 'david.gole.student@gov.si' },
  ]

  await redis.del('users')

  for (const user of users) {
    await redis.hset('users', { [user.id]: JSON.stringify(user) })
  }

  return NextResponse.json({ success: true, vstavljeni: users.length })
}