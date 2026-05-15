import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

interface User {
  id: string
  name: string
  email: string
}

export async function GET(): Promise<NextResponse> {
  const raw = await redis.hgetall<Record<string, User>>('users')
  if (!raw || Object.keys(raw).length === 0) return NextResponse.json([])
  const users: User[] = Object.values(raw)  // ← odstrani JSON.parse
  return NextResponse.json(users)
}

export async function POST(request: Request): Promise<NextResponse> {
  const user: User = await request.json()
  await redis.hset('users', { [user.id]: JSON.stringify(user) })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request): Promise<NextResponse> {
  const { id } = await request.json()
  await redis.hdel('users', id)
  return NextResponse.json({ success: true })
}