
import { Program, BN, AnchorProvider, Idl, Wallet } from '@coral-xyz/anchor';
import * as anchor from "@coral-xyz/anchor";
import fs from 'fs';

import {
  clusterApiUrl,
  Connection,
  Keypair,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  sendAndConfirmTransaction,
  PublicKey,
  LAMPORTS_PER_SOL,
  SYSVAR_RENT_PUBKEY,

} from "@solana/web3.js";
import {
  NATIVE_MINT,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAssociatedTokenAddress,
  createSyncNativeInstruction,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccount,
} from "@solana/spl-token";

import { log } from 'console';
import { HttpsProxyAgent } from 'hpagent';
import fetch from 'node-fetch';
import { config } from 'dotenv';
import {
  setupInitializeTest, setupDepositTest, initialize, deposit,
  swap_base_input, swap_base_output, setupSwapTest, setupSwapTestV2,
  proxy_buy_in_raydium, proxy_sell_in_raydium
} from "./utils";
import { configAddress } from "./config";


config();
const proxy = "http://127.0.0.1:7890";
const proxyAgent = new HttpsProxyAgent({ proxy });

const solanaConnection = new Connection(
  "https://devnet.helius-rpc.com/?api-key=0e4875a4-435d-4013-952a-1f82e3715f09",
  {
    commitment: 'confirmed',
  }
);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function main() {
  const payerPair = Keypair.fromSecretKey(
    new Uint8Array([
      194, 190, 60, 63, 95, 22, 140, 179, 70, 243, 28, 220, 186, 76,
      109, 68, 88, 173, 179, 40, 183, 12, 8, 181, 50, 171, 217, 169,
      72, 73, 55, 183, 174, 19, 209, 164, 211, 94, 134, 5, 107, 145,
      212, 183, 75, 35, 6, 121, 52, 174, 232, 11, 243, 177, 167, 69,
      176, 10, 81, 7, 223, 168, 78, 58])
  );
  // Client
  console.log("My address:", payerPair.publicKey.toString());
  const balance = await solanaConnection.getBalance(payerPair.publicKey);
  console.log(`My balance: ${balance / LAMPORTS_PER_SOL} SOL`);


  const smart_comtract_address = "99Y76UAMBqcPn3kMPfFmfhQ2DP7mxYFeH1veVqP8nrps";
  const payerWallet = new Wallet(payerPair)
  const provider = new AnchorProvider(solanaConnection, payerWallet, {
    commitment: 'confirmed',
  });
  const programId = new PublicKey(smart_comtract_address);
  const data = fs.readFileSync('./spl.json', 'utf8');  // 读取文件内容，使用 'utf8' 以获取字符串
  const jsonData = JSON.parse(data);
  const program = new Program(jsonData as Idl, programId, provider);

  // >> ------------------- raydium test4 -------------------
  // test route swap  
  const owner = payerPair;
  console.log("owner: ", owner.publicKey.toString());
  const confirmOptions = {
    skipPreflight: true,
  };
  const { cpSwapPoolState, cpSwapPoolState2 } = await setupSwapTestV2(
    program,
    solanaConnection,
    owner,
    { transferFeeBasisPoints: 0, MaxFee: 0 }
  );

  // token2(WSOL) -- token0(USDT)
  // token2(WSOL) -- token1(MEME)
  const inputMemeToken = cpSwapPoolState2.token1Mint;  // 卖meme
  const inputMemeTokenProgram = cpSwapPoolState2.token1Program;
  const outputUsdtlToken = cpSwapPoolState.token1Mint;  // 得到 USDT
  const outputUsdtTokenProgram = cpSwapPoolState.token1Program;
  await sleep(1000);
  const baseOutTx = await proxy_sell_in_raydium(
    program,
    owner,
    configAddress,
    inputMemeToken,
    inputMemeTokenProgram,
    outputUsdtlToken,
    outputUsdtTokenProgram,
    new BN(100000000),
    new BN(0),
    confirmOptions
  );
  console.log("baseOutputTx:", baseOutTx);
  // << ------------------- raydium test3 -------------------
}

main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  },
);
