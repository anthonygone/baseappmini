export const COUNTER_ADDRESS = '0xYourDeployedContractAddress' as const

export const counterAbi = [
  { type: 'function', name: 'number', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'increment', inputs: [], outputs: [], stateMutability: 'nonpayable' },
] as const
