export interface ApiCpmmConfigInfo {
  id: string;
  index: number;
  protocolFeeRate: number;
  tradeFeeRate: number;
  fundFeeRate: number;
  createPoolFee: string;
}

/** ====== v3 api types ======= */
export interface ApiV3PageIns<T> {
  count: number;
  hasNextPage: boolean;
  data: T[];
}

export enum JupTokenType {
  ALL = "all",
  Strict = "strict",
}

export interface TransferFeeDataBaseType {
  transferFeeConfigAuthority: string;
  withdrawWithheldAuthority: string;
  withheldAmount: string;
  olderTransferFee: {
    epoch: string;
    maximumFee: string;
    transferFeeBasisPoints: number;
  };
  newerTransferFee: {
    epoch: string;
    maximumFee: string;
    transferFeeBasisPoints: number;
  };
}

type ExtensionsItem = {
  coingeckoId?: string;
  feeConfig?: TransferFeeDataBaseType;
};

export type ApiV3Token = {
  chainId: number;
  address: string;
  programId: string;
  logoURI: string;
  symbol: string;
  name: string;
  decimals: number;
  tags: string[]; // "hasFreeze" | "hasTransferFee" | "token-2022" | "community" | "unknown" ..etc
  extensions: ExtensionsItem;
  freezeAuthority?: string;
  mintAuthority?: string;
};

export interface ApiV3PoolInfoCountItem {
  volume: number;
  volumeQuote: number;
  volumeFee: number;
  apr: number;
  feeApr: number;
  priceMin: number;
  priceMax: number;
  rewardApr: number[];
}

type PoolTypeItem = "StablePool" | "OpenBookMarket";
export type PoolKeys = CpmmKeys;

export interface ApiV3PoolInfoBaseItem {
  programId: string;
  id: string;
  mintA: ApiV3Token;
  mintB: ApiV3Token;
  rewardDefaultPoolInfos: "Ecosystem" | "Fusion" | "Raydium" | "Clmm";
  price: number;
  mintAmountA: number;
  mintAmountB: number;
  feeRate: number;
  openTime: string;
  tvl: number;

  day: ApiV3PoolInfoCountItem;
  week: ApiV3PoolInfoCountItem;
  month: ApiV3PoolInfoCountItem;
  pooltype: PoolTypeItem[];

  farmUpcomingCount: number;
  farmOngoingCount: number;
  farmFinishedCount: number;

  burnPercent: number;
}

export type ApiV3PoolInfoStandardItemCpmm = ApiV3PoolInfoBaseItem & {
  type: "Standard";
  lpMint: ApiV3Token;
  lpPrice: number;
  lpAmount: number;
  config: ApiCpmmConfigV3;
};

interface Base {
  programId: string;
  id: string;
  mintA: ApiV3Token;
  mintB: ApiV3Token;
  lookupTableAccount?: string;
  openTime: string;
  vault: { A: string; B: string };
}

export type ApiV3TokenRes = {
  mintList: ApiV3Token[];
  blacklist: string[];
  whiteList: string[];
};

interface ApiCpmmConfigV3 {
  id: string;
  index: number;
  protocolFeeRate: number;
  tradeFeeRate: number;
  fundFeeRate: number;
  createPoolFee: string;
}

interface _Cpmm {
  authority: string;
  mintLp: ApiV3Token;
  config: ApiCpmmConfigV3;
  observationId: string;
}

export type CpmmKeys = Base & _Cpmm;

export interface AvailabilityCheckAPI3 {
  all: boolean;
  swap: boolean;
  createConcentratedPosition: boolean;
  addConcentratedPosition: boolean;
  addStandardPosition: boolean;
  removeConcentratedPosition: boolean;
  removeStandardPosition: boolean;
  addFarm: boolean;
  removeFarm: boolean;
}