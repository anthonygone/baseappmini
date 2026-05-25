'use client'

import { useReadContract } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { COUNTER_ADDRESS, counterAbi } from '@/config/counter'

export function CounterDisplay() {
  const { data: count, isLoading } = useReadContract({
    address: COUNTER_ADDRESS,
    abi: counterAbi,
    functionName: 'number',
    chainId: baseSepolia.id,
  })

  return (
    <div className="text-6xl font-bold">
      {isLoading ? '...' : count?.toString() ?? '0'}
    </div>
  )
}
