import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

interface PuzzleData {
  rezultati: { ime: string; vloga: string }[]
}

function getTodayKey(): string {
  return `puzzle_solved_${new Date().toISOString().split('T')[0]}`
}

function getTTL(): number {
  return 60 // testiranje
}

export async function GET(): Promise<NextResponse> {
  const key = getTodayKey()
  const data = await redis.get<PuzzleData>(key)  // ← tip namesto string
  if (!data) return NextResponse.json({ solved: false, ttl: null, rezultati: [] })

  const ttl = await redis.ttl(key)
  return NextResponse.json({ solved: true, ttl, rezultati: data.rezultati ?? [] })
}

export async function POST(request: Request): Promise<NextResponse> {
  const { rezultati } = await request.json()
  const key = getTodayKey()
  await redis.set(key, { rezultati }, { ex: getTTL() })  // ← brez JSON.stringify
  return NextResponse.json({ success: true })
}