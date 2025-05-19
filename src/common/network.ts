import { Connection, PublicKey } from '@solana/web3.js'
import { DEVNET_PROGRAM_ID, SOLANA_PROGRAM_ID, SONIC_PROGRAM_ID } from './programId'

export enum Network {
  SonicMainnet = 'SonicMainnet',
  SonicTestnetV1 = 'SonicTestnetV1',
  SolanaMainnet = 'SolanaMainnet',
}

export function getConnection(networkName: string, isArchive = true): Connection {
  return new Connection(isArchive ? archiveRpcs[networkName] : rpcs[networkName])
}

export function getProgramId(networkName: string): Record<string, PublicKey> {
  return programIds[networkName]
}

export const rpcs: Record<Network, string> = {
  [Network.SonicMainnet]: 'https://api.mainnet-alpha.sonic.game',
  [Network.SonicTestnetV1]: 'https://api.testnet.v1.sonic.game',
  [Network.SolanaMainnet]: 'https://api.mainnet-beta.solana.com',
}

export const archiveRpcs: Record<Network, string> = {
  [Network.SonicMainnet]: 'https://archival-mainnet.sonic.game',
  [Network.SonicTestnetV1]: 'https://archival-testnet.sonic.game',
  [Network.SolanaMainnet]: 'https://api.mainnet-beta.solana.com',
}

export const programIds: Record<Network, Record<string, PublicKey>> = {
  [Network.SonicMainnet]: SONIC_PROGRAM_ID,
  [Network.SonicTestnetV1]: DEVNET_PROGRAM_ID,
  [Network.SolanaMainnet]: SOLANA_PROGRAM_ID,
}
