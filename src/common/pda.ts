import { PublicKey } from "@solana/web3.js";

import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { findProgramAddress } from "./txTool/txUtils";
import { METADATA_PROGRAM_ID } from "@/common/pubKey";

export function getATAAddress(
  owner: PublicKey,
  mint: PublicKey,
  programId?: PublicKey,
): {
  publicKey: PublicKey;
  nonce: number;
} {
  return findProgramAddress(
    [owner.toBuffer(), (programId ?? TOKEN_PROGRAM_ID).toBuffer(), mint.toBuffer()],
    new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
  );
}

export function getPdaMetadataKey(mint: PublicKey): {
  publicKey: PublicKey;
  nonce: number;
} {
  return findProgramAddress(
    [Buffer.from("metadata", "utf8"), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METADATA_PROGRAM_ID,
  );
}
