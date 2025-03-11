import { PublicKey } from "@solana/web3.js";

export const CREATE_CPMM_POOL_PROGRAM = new PublicKey("SegazTQwbYWknDZkJ6j2Kgvm5gw3MrHGKtWstZdoNKZ");
export const CREATE_CPMM_POOL_AUTH = new PublicKey("Ajk8d9bERSaFdeoT1d8JUVfaDayrYLnAdgeB47TFMUaG");
export const CREATE_CPMM_POOL_FEE_ACC = new PublicKey("2HbjxVVKJ7Ct72Rcd8WK4VTqmwTXL5aAggkH1CHGFGmh");

export const DEV_CREATE_CPMM_POOL_PROGRAM = new PublicKey("auetiVUVJkRxvNPLYEvVnz8UJSqQ1VgoA83PcicHVD1");
export const DEV_CREATE_CPMM_POOL_AUTH = new PublicKey("GzqQwxPSmUZnTyCfX9YWqi32MJg43ujP786ZoacL559Y");
export const DEV_CREATE_CPMM_POOL_FEE_ACC = new PublicKey("GzqQwxPSmUZnTyCfX9YWqi32MJg43ujP786ZoacL559Y");

export const ALL_PROGRAM_ID = {
  CREATE_CPMM_POOL_PROGRAM,
  CREATE_CPMM_POOL_AUTH,
  CREATE_CPMM_POOL_FEE_ACC,
};

export type ProgramIdConfig = Partial<typeof ALL_PROGRAM_ID>;

export const DEVNET_PROGRAM_ID = {
  SERUM_MARKET: PublicKey.default,
  UTIL1216: PublicKey.default,
  CREATE_CPMM_POOL_PROGRAM: DEV_CREATE_CPMM_POOL_PROGRAM,
  CREATE_CPMM_POOL_AUTH: DEV_CREATE_CPMM_POOL_AUTH,
  CREATE_CPMM_POOL_FEE_ACC: DEV_CREATE_CPMM_POOL_FEE_ACC,
};
