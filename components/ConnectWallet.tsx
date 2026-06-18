'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function ConnectWallet() {
  const { address, isConnected, isConnecting } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (!isConnected) {
    return (
      <div className="flex flex-col gap-2">
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            disabled={isConnecting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Connect {connector.name}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </span>
      <button onClick={() => disconnect()} className="text-red-500">
        Disconnect
      </button>
    </div>
  )
}
