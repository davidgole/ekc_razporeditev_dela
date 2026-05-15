import { redis } from '@/lib/redis'
import HomeClient from './HomeClient'

interface User {
  id: string
  name: string
  email: string
}

interface Rezultat {
  ime: string
  vloga: string
}

async function getUsers(): Promise<User[]> {
  try {
    const raw = await redis.hgetall<Record<string, User>>('users')
    if (!raw || Object.keys(raw).length === 0) return []
    return Object.values(raw)
  } catch {
    return []
  }
}

async function getPuzzleStatus(): Promise<{ jeZaklenjen: boolean; rezultati: Rezultat[] }> {
  try {
    const key = `puzzle_solved_${new Date().toISOString().split('T')[0]}`
    const raw = await redis.get<string>(key)
    if (!raw) return { jeZaklenjen: false, rezultati: [] }
    const data = JSON.parse(raw)
    return { jeZaklenjen: true, rezultati: data.rezultati ?? [] }
  } catch {
    return { jeZaklenjen: false, rezultati: [] }
  }
}

export default async function Home() {
  const [users, { jeZaklenjen, rezultati }] = await Promise.all([
    getUsers(),
    getPuzzleStatus()
  ])
  return (
    <HomeClient
      users={users}
      initialJeZaklenjen={jeZaklenjen}
      initialRezultati={rezultati}
    />
  )
}