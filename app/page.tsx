import HomeClient from './HomeClient'
import { redis } from '@/lib/redis'

interface User {
  id: string
  name: string
  email: string
}

async function getUsers(): Promise<User[]> {
  try {
    const raw = await redis.hgetall<Record<string, User>>('users')
    console.log('RAW iz Redis:', JSON.stringify(raw))
    if (!raw || Object.keys(raw).length === 0) return []
    return Object.values(raw)  // ← odstrani JSON.parse, vrednosti so že objekti
  } catch (e) {
    console.error('Redis napaka:', e)
    return []
  }
}

export default async function Home() {
  const users = await getUsers()
  return <HomeClient users={users} />
}