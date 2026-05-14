import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

export async function GET(): Promise<NextResponse> {
  await redis.set('test', 'Baza deluje!')
  const value = await redis.get<string>('test')
  return NextResponse.json({ value })
}