import { http, createConfig, createStorage, cookieStorage } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { injected, baseAccount } from 'wagmi/connectors'

export const config = createConfig({
  chains: [baseSepolia, base], // Add mainnet when ready
  connectors: [
    injected(),
    baseAccount({ appName: 'My Base Mini App' }),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
    [base.id]: http('https://mainnet.base.org'),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
