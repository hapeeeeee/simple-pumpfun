import { TokenListProvider} from '@solana/spl-token-registry';
import { Program, AnchorProvider, Idl, Wallet } from '@project-serum/anchor';
import fs from 'fs';
import BN from "bn.js";
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
  AccountMeta,
} from "@solana/web3.js";
import {
  NATIVE_MINT,
  createMint,
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  transfer
} from "@solana/spl-token";
import { Address, TransactionType,Helius } from "helius-sdk";
import { assert, log } from 'console';
import { HttpsProxyAgent } from 'hpagent';
import fetch from 'node-fetch';
import { config } from 'dotenv';
import { ComputeBudgetProgram } from '@solana/web3.js';
import { sleep } from '@raydium-io/raydium-sdk-v2';
// import { AnchorProvider } from '@coral-xyz/anchor';

// 连接开发网 
config();
const proxy = "http://127.0.0.1:7890";
const proxyAgent = new HttpsProxyAgent ({ proxy });
const solanaConnection = new Connection(
  "https://devnet.helius-rpc.com/?api-key=0e4875a4-435d-4013-952a-1f82e3715f09", 
  {commitment: 'confirmed',}
);


export async function main() {
  
  // 付款者的钱包
  const payerPair = Keypair.fromSecretKey(
    new Uint8Array([59,146,162,139,107,227,120,35,174,22,248,181,95,
      65,5,104,254,92,135,184,246,140,59,159,186,200,77,42,
      228,105,205,189,33,109,97,47,57,231,171,21,34,181,40,147,110,246,
      164,74,25,206,94,7,66,7,209,11,81,222,191,57,132,110,235,117
    ])
  );
  
  // 付款者的公钥和SOL数量
  console.log("My address:", payerPair.publicKey.toString());
  const balance = await solanaConnection.getBalance(payerPair.publicKey);
  console.log(`My balance: ${balance / LAMPORTS_PER_SOL} SOL`);

  // 其他人的钱包
  const UserPair = Keypair.fromSecretKey(
    new Uint8Array([61,13,53,211,36,120,102,226,219,58,63,134,110,72,
      215,174,57,145,88,42,134,172,56,29,35,105,220,126,129,185,156,2,16,
      215,194,45,59,106,212,183,16,91,214,6,145,159,188,14,220,242,175,
      33,72,180,104,142,145,93,106,40,227,35,244,120
    ])
  );
  

  // 部署在链上的合约地址
  const smart_comtract_address = "ijo8fHCzsMSbEsGfz8anAenQ2BdToa9SmMx15pRmomo";

  // 在链下连接链上程序
  const payerWallet = new Wallet(payerPair)
  const provider = new AnchorProvider(solanaConnection, payerWallet, {commitment: 'confirmed',});
  const programId = new PublicKey(smart_comtract_address);
  const data = fs.readFileSync('./spl2.json', 'utf8');  // 读取文件内容，使用 'utf8' 以获取字符串
  const jsonData = JSON.parse(data);
  const program = new Program(jsonData as Idl, programId, provider);
  // 创建Create函数监听器
  const listenerCreateToken = program.addEventListener(
    "EVENTCreateToken",
    async (event, slot) => {
      console.log(
        `EVENTCreateToken: txid= ${event.txid}, name = ${event.name},symbol = ${event.symbol}`
      );
    }
  );

  // 创建Mint函数监听器
  const listenerMintToken = program.addEventListener(
    "EVENTMintToken",
    (event, slot) => {
      console.log(
        `EVENTMintToken: txid= ${event.txid}, dest_token_account = ${event.tokenAccount.toBase58()},amount = ${event.amount}`
      );
      // console.log(`EVENTMintToken event: ${event}`);
      // console.log(JSON.stringify(event, null, 2));

      console.log(`EVENTMintToken slot: ${slot}`);
    }
  );

  // 创建burn函数监听器
  const listenerBurnToken = program.addEventListener(
    "EVENTBurnToken",
    (event, slot) => {
      console.log(
        `EVENTBurnToken: txid= ${event.txid},token_account = ${event.tokenAccount.toBase58()},amount = ${
          event.amount
        }`
      );
    }
  );

  // 创建createPool函数监听器
  const listenerCreatePool = program.addEventListener(
    "EVENTCreatePool",
    (event, slot) => {
      console.log(
        `CreatePool: txid= ${event.txid}, token_id = ${event.tokenId}, pool = ${event.pool.toBase58()}, 
        pooltokenaccount = ${event.poolTokenAccount.toBase58()}, initSol: ${event.initSol}, initMeme: ${event.initToken},
        reserveSol: ${event.reserveSol}, reserveToken: ${event.reserveToken}`, 
      );
    }
  );
  

  // 创建buy函数监听器
  const listenerBuyToken = program.addEventListener(
    "EVENTBuyToken",
    (event, slot) => {
      console.log(
        `EVENTBuyToken: token_id = ${event.tokenId}, solAmount = ${event.solAmount}, tokenAmount = ${event.tokenAmount}`, 
      );
    }
  );
  
  // 创建buy函数监听器
  const listenerDebuginfo = program.addEventListener(
    "EVENTDebugInfo",
    (event, slot) => {
      console.log(
        `EVENTDebugInfo: t ${event.info}`, 
      );
    }
  );
  

  const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s" // 官方提供的API程序
  );



  // 代币的随机种子和描述信息
  const DIFF_SEED = "ppkk";
  const metadata = {
    name: DIFF_SEED,  // 代币名字
    symbol: DIFF_SEED,  // 
    uri: "https://arweave.net/Xjqaj_rYYQGrsiTk9JRqpguA813w6NGPikcRyA1vAHM",
    decimals: 9,
    id: DIFF_SEED,  // 代币ID，必须与随机种子一致！！！！
    txid: "Txid,creattoken",
  };

  // Token在链上的mint地址
  const [metadatamint, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint"), Buffer.from(metadata.id)],
    program.programId
  );
  console.log("metadatamint address: ", metadatamint.toBase58());

  // Token的元数据账户
  const [metadataAddress] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      metadatamint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );





  // // --------------------------CreateToken Start-------------------------------
  // {
  //   console.log("\n--------------------------CreateToken Start -----------------------------");
  //   // 此处判断新Token的Mint是否存在，存在则冲突，不再继续创建币
  //   const info = await solanaConnection.getAccountInfo(metadatamint);
  //   if (info) {
  //     console.log("metadatamint exists");
  //     return; // Do not attempt to initialize if already initialized
  //   }
  //   console.log("  Mint not found. Initializing Program...");

  //   // 打包合约所需账户
  //   const context = {
  //     metadata: metadataAddress,
  //     mint: metadatamint,
  //     payer: payerPair.publicKey,
  //     rent: SYSVAR_RENT_PUBKEY,
  //     systemProgram: SystemProgram.programId,
  //     tokenProgram: TOKEN_PROGRAM_ID,
  //     tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
  //   };

  //   // 调用合约
  //   const txHash = await program.methods
  //     .createToken(metadata)
  //     .accounts(context)
  //     .signers([payerPair])
  //     .rpc();
    
  //   // 等待交易确认
  //   await solanaConnection.confirmTransaction(txHash, "finalized");
  //   console.log(`  https://explorer.solana.com/tx/${txHash}?cluster=devnet`);
  //   console.log("\n--------------------------CreateToken End -----------------------------");
  // }
  // // --------------------------CreateToken End-------------------------------

 

  // --------------------------MintTokenBatchWithCreateAta Start-------------------------------
  {
    console.log("\n--------------MintTokenBatchWithCreateAta Start------------")
    let users_wallet_without_ata = [
      new PublicKey("AYUgtQ39Nr8oYws2kDnTR5EZAzy7oeR1fz64LWgzUqA1"),
      new PublicKey("DdUd5jBypT25nNBaTek1yv9ZFjrTfdUb49DMk9Ng1Ps5"),
      new PublicKey("5QRePQwg9wQRU4RjTrWT1hrCnSDzKrW1NTVSFDvfbDHm"),
      new PublicKey("9XD5eFkT9VwUMHnLMheEz1gMuTZpaWA5R9bURMiLMfBU"),
      new PublicKey("Ha3nnNr5vYyZLwkbtG68uCXxvdan1TVUN8qQVaNzzAQF"),
      new PublicKey("98ovJrZrsvQcNtREETyjL5WwEKGqVBDQPBBLmu8EmMua"),
      new PublicKey("HbVMaaEf67g1cntXg27gnyvZDQgAiQRtVgZL5hjjVjpQ"),
      new PublicKey("4xUaGhxmXYwjtFUCA87ajwKdAUfQmpRSsHPAtPS26CVT"),
      new PublicKey("CVCLAeDKesf2KhodAXpv7UVPa3nAfoCb2sG4Usy9LNNS"),
      new PublicKey("Gp6BxKRfbwikTq7Z3acVP3fWKpvvYLkKyUddpif42fgK"),
    ];
    let users_token_account = []
    let users_amount: Array<BN> = [];
    for (let i = 0; i < users_wallet_without_ata.length; i++) {
      const user_wallet = users_wallet_without_ata[i];
      const user_token_account = getAssociatedTokenAddressSync(metadatamint, user_wallet)
      console.log(`user${i} token account: ${user_token_account.toBase58()}`);
      users_token_account.push(user_token_account);
      users_amount.push(new BN((i+1) * 10 * 10 ** metadata.decimals))

      // users_amount.push(new BN(i * 10 * 10 ** metadata.decimals));
    }
    console.log("users_wallet.length = ", users_wallet_without_ata.length);
    assert(users_wallet_without_ata.length == users_token_account.length);
    let  remaining_accounts: Array<AccountMeta>  = []
    for (let i = 0; i <= users_wallet_without_ata.length ; i++) {
      if (users_wallet_without_ata[i] && users_token_account[i]) {
        remaining_accounts.push( { pubkey: users_wallet_without_ata[i], isWritable: true, isSigner: false } as AccountMeta)
        remaining_accounts.push( { pubkey: users_token_account[i], isWritable: true, isSigner: false } as AccountMeta)
      }
    }
    console.log("remaining_accounts.length = ", remaining_accounts.length);
    const mint_tokens_params = {
      quantity: users_amount,
      id: DIFF_SEED, 
      txid: "Txid,mint_tokens",
    };

    const contextMintTokenBatch = {
      mint: metadatamint,
      payer: payerPair.publicKey,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    };

    const tx = new Transaction()
        .add(
          ComputeBudgetProgram.setComputeUnitLimit({ units: 2_000_000 }),
          ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1200_000 }),
          await program.methods
            .mintTokensBatchWithCreateAta(mint_tokens_params)
            .accounts(contextMintTokenBatch)
            .remainingAccounts(remaining_accounts)
            .instruction()
        )
      tx.feePayer = payerPair.publicKey
      tx.recentBlockhash = (await solanaConnection.getLatestBlockhash()).blockhash
      await solanaConnection.simulateTransaction(tx)
      const sig = await sendAndConfirmTransaction(solanaConnection, tx, [payerPair], { skipPreflight: true })
      console.log("Successfully initialized : ", `https://solscan.io/tx/${sig}?cluster=devnet`)
      console.log("--------------MintTokenBatchWithCreateAta end------------\n")
    // console.log(users_wallet[0].toBase58())
    // console.log(users_wallet[1].toBase58())
    // await solanaConnection.confirmTransaction(tx);
  }

  // --------------------------MintTokenBatchWithCreateAta End-------------------------------
  sleep(5000)
  // --------------------------MintTokenBatch start---------------
  {
    console.log("\n--------------MintTokenBatch start------------")
    let users_wallet_with_ata = [
      new PublicKey("7wH7cn6XrEM4rYKTkDbnj5CURyQozNyKCHdQyQQ6aYZf"),
      new PublicKey("FFuSjxiiBwoeAHY73pWUXb91jMRjr2uTbKaR3PFowfmD"),
    ];
    let users_token_account = []
    let users_amount: Array<BN> = [];
    for (let i = 0; i < users_wallet_with_ata.length; i++) {
      const user_wallet = users_wallet_with_ata[i];
      const user_token_account = getAssociatedTokenAddressSync(metadatamint, user_wallet)
      console.log(`user${i} token account: ${user_token_account.toBase58()}`);
      users_token_account.push(user_token_account);
      users_amount.push(new BN((i+1) * 10 * 10 ** metadata.decimals))
    }
    console.log("users_wallet.length = ", users_wallet_with_ata.length);
    assert(users_wallet_with_ata.length == users_token_account.length);
    let  remaining_accounts: Array<AccountMeta>  = []
    for (let i = 0; i <= users_wallet_with_ata.length ; i++) {
      if (users_wallet_with_ata[i] && users_token_account[i]) {
        remaining_accounts.push( { pubkey: users_token_account[i], isWritable: true, isSigner: false } as AccountMeta)
      }
    }

    console.log("remaining_accounts.length = ", remaining_accounts.length);
    const mint_tokens_params = {
      quantity: users_amount,
      id: DIFF_SEED, 
      txid: "Txid,mint_tokens",
    };

    const contextMintTokenBatch = {
      mint: metadatamint,
      payer: payerPair.publicKey,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    };

    const tx = new Transaction()
        .add(
          ComputeBudgetProgram.setComputeUnitLimit({ units: 2_000_000 }),
          ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1200_000 }),
          await program.methods
            .mintTokensBatch(mint_tokens_params)
            .accounts(contextMintTokenBatch)
            .remainingAccounts(remaining_accounts)
            .instruction()
        )
      tx.feePayer = payerPair.publicKey
      tx.recentBlockhash = (await solanaConnection.getLatestBlockhash()).blockhash
      await solanaConnection.simulateTransaction(tx)
      const sig = await sendAndConfirmTransaction(solanaConnection, tx, [payerPair], { skipPreflight: true })
      console.log("Successfully initialized : ", `https://solscan.io/tx/${sig}?cluster=devnet`)
      console.log("\n--------------MintTokenBatch end------------")
  }
  // ---------------------------MintTokenBatch end---------------
  program.removeEventListener(listenerCreateToken);
  program.removeEventListener(listenerMintToken);
  program.removeEventListener(listenerBurnToken);
  program.removeEventListener(listenerCreatePool);
  program.removeEventListener(listenerBuyToken);
}

main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  },
);