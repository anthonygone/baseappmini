import { ConnectWallet } from '@/components/ConnectWallet'
import { CounterDisplay } from '@/components/CounterDisplay'
// Import Increment button too

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold">Base Mini App</h1>
      <ConnectWallet />
      <CounterDisplay />
      {/* Add increment button here */}
    </main>
  )
}
