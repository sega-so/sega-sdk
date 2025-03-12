import { Connection } from '@solana/web3.js'

export enum Network {
  SonicMainnet = 'SonicMainnet',
  SonicTestnetV1 = 'SonicTestnetV1',
}

export function getConnection(networkName: string, isArchive = true): Connection {
  const isMainnet = networkName === Network.SonicMainnet
  const network = isMainnet ? Network.SonicMainnet : Network.SonicTestnetV1
  return new Connection(isArchive ? archiveRpcs[network] : rpcs[network])
}

const rpcs: Record<Network, string> = {
  [Network.SonicMainnet]: 'https://api.mainnet-alpha.sonic.game',
  [Network.SonicTestnetV1]: 'https://api.testnet.v1.sonic.game',
}

const archiveRpcs: Record<Network, string> = {
  [Network.SonicMainnet]: 'https://archival-mainnet.sonic.game',
  [Network.SonicTestnetV1]: 'https://archival-testnet.sonic.game',
}
