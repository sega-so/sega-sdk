import { Keypair, PublicKey } from "@solana/web3.js";
import { Sega, Network, getConnection, CurveCalculator } from "../src/index";
import BN from "bn.js";
import bs58 from "bs58";
import { describe, it, expect } from "vitest";

describe("Swap Functionality", () => {
  it("should successfully swap tokens", async () => {
    // Initialize connection and SDK
    const network = Network.SonicTestnetV1;
    const connection = getConnection(network);

    const wallet = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY || ""));

    const sega = await Sega.load({
      cluster: 'testnet',
      connection,
      owner: wallet,
      apiRequestInterval: 5 * 60 * 1000,
      apiRequestTimeout: 10 * 1000,
      apiCacheTime: 5 * 60 * 1000,
      blockhashCommitment: 'confirmed',
    });

    const usdcMint = new PublicKey("8EdufEDLupX62qQaAMez9nFCXr5vKZ4w8tFgrJXAjTyk");
    // const btcMint = new PublicKey("aoGxsgFQrTXHjnpJPjDt6jK3DsLUwNLHCJ2v29f4ZJa");
    const poolId = "BmaLNG7n6Aj4pfpUqaaGwyujEkhcoXBcuaPGwN71Wo2R"

    const inputAmount = new BN(100)
    const inputMint = usdcMint.toBase58()

    const data = await sega.cpmm.getPoolInfoFromRpc(poolId)
    const poolInfo = data.poolInfo
    const poolKeys = data.poolKeys
    const rpcData = data.rpcData
    if (inputMint !== poolInfo.mintA.address && inputMint !== poolInfo.mintB.address)
      throw new Error('input mint does not match pool')

    const baseIn = inputMint === poolInfo.mintA.address
    const swapResult = CurveCalculator.swap(
      inputAmount,
      baseIn ? rpcData.baseReserve : rpcData.quoteReserve,
      baseIn ? rpcData.quoteReserve : rpcData.baseReserve,
      rpcData.configInfo!.tradeFeeRate
    )
    const { execute } = await sega.cpmm.swap({
      poolInfo,
      poolKeys,
      inputAmount,
      swapResult,
      slippage: 0.001, // range: 1 ~ 0.0001, means 100% ~ 0.01%
      baseIn,
    })
    const { txId } = await execute({ sendAndConfirm: true })

    // Add assertions
    expect(txId).toBeDefined();
    expect(typeof txId).toBe("string");

    console.log(`swapped: ${poolInfo.mintA.symbol} to ${poolInfo.mintB.symbol}:`, { txId: `https://explorer.sonic.game/${txId}?cluster=testnet.v1` })
  });
});
