import { Connection, PublicKey, AddressLookupTableAccount } from "@solana/web3.js";
import { getMultipleAccountsInfo } from "../accountInfo";

export interface CacheLTA {
  [key: string]: AddressLookupTableAccount;
}

export async function getMultipleLookupTableInfo({
  connection,
  address,
}: {
  connection: Connection;
  address: PublicKey[];
}): Promise<CacheLTA> {
  const dataInfos = await getMultipleAccountsInfo(
    connection,
    [...new Set<string>(address.map((i) => i.toString()))].map((i) => new PublicKey(i)),
  );

  const outDict: CacheLTA = {};
  for (let i = 0; i < address.length; i++) {
    const info = dataInfos[i];
    const key = address[i];
    if (!info) continue;
    const lookupAccount = new AddressLookupTableAccount({
      key,
      state: AddressLookupTableAccount.deserialize(info.data),
    });
    outDict[key.toString()] = lookupAccount;
    LOOKUP_TABLE_CACHE[key.toString()] = lookupAccount;
  }

  return outDict;
}

export const LOOKUP_TABLE_CACHE: CacheLTA = {};
