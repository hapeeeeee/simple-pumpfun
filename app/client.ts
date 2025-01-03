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
} from "@solana/web3.js";
import {
  NATIVE_MINT,
  createMint,
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import { Address, TransactionType,Helius } from "helius-sdk";
import { log } from 'console';
import { HttpsProxyAgent } from 'hpagent';
import fetch from 'node-fetch';
import { config } from 'dotenv';
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
  const data = fs.readFileSync('./spl.json', 'utf8');  // 读取文件内容，使用 'utf8' 以获取字符串
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
  const DIFF_SEED = "KKPL";
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





  // --------------------------CreateToken Start-------------------------------
  {
    console.log("\n--------------------------CreateToken Start -----------------------------");
    // 此处判断新Token的Mint是否存在，存在则冲突，不再继续创建币
    const info = await solanaConnection.getAccountInfo(metadatamint);
    if (info) {
      console.log("metadatamint exists");
      return; // Do not attempt to initialize if already initialized
    }
    console.log("  Mint not found. Initializing Program...");

    // 打包合约所需账户
    const context = {
      metadata: metadataAddress,
      mint: metadatamint,
      payer: payerPair.publicKey,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    };

    // 调用合约
    const txHash = await program.methods
      .createToken(metadata)
      .accounts(context)
      .signers([payerPair])
      .rpc();
    
    // 等待交易确认
    await solanaConnection.confirmTransaction(txHash, "finalized");
    console.log(`  https://explorer.solana.com/tx/${txHash}?cluster=devnet`);
    console.log("\n--------------------------CreateToken End -----------------------------");
  }
  // --------------------------CreateToken End-------------------------------

  // // --------------------------CreatePool Start -----------------------------
  // {
  //   console.log("\n--------------------------CreatePool Start -----------------------------");
  //   const mintAmount = 1000;
  //   // Token在链上的mint地址
  //   const [poolPda, poolBump] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("pool"), metadatamint.toBuffer()],
  //     program.programId
  //   );
  //   console.log("pool pda:", poolPda.toBase58());
  //   const [poolSolPda, poolSolBump] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("pool_sol"), metadatamint.toBuffer()],
  //     program.programId
  //   );
  //   console.log("poolSolPda: ", poolSolPda);
  //   const info = await solanaConnection.getAccountInfo(poolPda);
  //   if (info) {
  //     console.log("poolPda exists");
  //     return; // Do not attempt to initialize if already initialized
  //   }

    const pool_token_account = await getOrCreateAssociatedTokenAccount(
  //     program.provider.connection,
  //     payerPair,          // 创建token账户的付款者
  //     metadatamint,       // Token绑定的Mint地址
  //     poolPda, // 目标账户的公钥
  //     true
  //   );
    
    
    
  //   const contextCreatePool = {
  //     pool: poolPda,
  //     mint: metadatamint,
  //     poolTokenAccount: pool_token_account.address,
  //     poolSolAccount: poolSolPda,
  //     payer: payerPair.publicKey,
  //     rent: SYSVAR_RENT_PUBKEY,
  //     systemProgram: SystemProgram.programId,
  //     tokenProgram: TOKEN_PROGRAM_ID,
  //     associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //   };
  //   const create_pool_params = {
  //     id: DIFF_SEED,  // Token的随机种子，必须与DIFF_SEED一致
  //     txid: "Txid,create_pool_params",
  //     initialSol: new BN(10 * LAMPORTS_PER_SOL),
  //     initialToken: new BN(mintAmount * 10 ** metadata.decimals),
  //     reserveSol: new BN(0 * LAMPORTS_PER_SOL),
  //     reserveToken: new BN(mintAmount * LAMPORTS_PER_SOL),
  //   };

  //   const txHash = await program.methods
  //     .createPool(create_pool_params)
  //     .accounts(contextCreatePool)
  //     .signers([payerPair])
  //     .rpc();

  //   console.log("--------------------------CreatePool End -----------------------------\n");
  // }
  // // --------------------------CreatePool End -----------------------------

  // // --------------------------Mint Token To Pool Start -------------------------------
  // {
  //   console.log("\n--------------------------Mint Token To Pool Start -----------------------------");
  //   // mint的代币数量
  //   const mintAmount = 900;
  //   const [poolPda, poolBump] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("pool"), metadatamint.toBuffer()],
  //     program.programId
  //   );
  //   const pool_token_account = await getAssociatedTokenAddressSync(
  //     metadatamint,       // Token绑定的Mint地址
  //     poolPda,             // tokenAccount所有者的公钥
  //     true
  //   );

  //   console.log(
  //     "pool_token_account.address:",
  //     pool_token_account.toBase58()
  //   );

  //   const mint_tokens_params = {
  //     quantity: new BN(mintAmount * 10 ** metadata.decimals),
  //     id: DIFF_SEED,  // Token的随机种子，必须与DIFF_SEED一致
  //     txid: "Txid,mint_tokens_to_pool",
  //   };

  //   const contextMintToken = {
  //     mint: metadatamint,
  //     destination: pool_token_account,
  //     payer: payerPair.publicKey,
  //     rent: SYSVAR_RENT_PUBKEY,
  //     systemProgram: SystemProgram.programId,
  //     tokenProgram: TOKEN_PROGRAM_ID,
  //     associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //   };

  //   const txHashMintToken = await program.methods
  //     .mintTokens(mint_tokens_params)
  //     .accounts(contextMintToken)
  //     .signers([payerPair]) // Token创建者的公私钥对
  //     .rpc();
  //   await program.provider.connection.confirmTransaction(txHashMintToken);
  //   console.log(
  //     `  mint token to Pool https://explorer.solana.com/tx/${txHashMintToken}?cluster=devnet`
  //   );
  //   console.log("--------------------------Mint Token To Pool End -----------------------------\n");
  // }
  // --------------------------Mint Token To Pool End -------------------------------

  // // --------------------------MintToken Start-------------------------------
  // {
  //   // const [mint, bump] = web3.PublicKey.findProgramAddressSync(
  //   //   [Buffer.from("mint"), Buffer.from(metadata.id)],
  //   //   program.programId
  //   // );

  //   // mint的代币数量
  //   const mintAmount = 100;
  //   // 目标钱包的token账户
  //   const to_token_account = await getOrCreateAssociatedTokenAccount(
  //     program.provider.connection,
  //     payerPair,          // 创建token账户的付款者
  //     metadatamint,       // Token绑定的Mint地址
  //     payerPair.publicKey // 目标账户的公钥
  //   );
  //   console.log(
  //     "to_token_account.address:",
  //     to_token_account.address.toBase58()
  //   );

  //   const mint_tokens_params = {
  //     quantity: new BN(mintAmount * 10 ** metadata.decimals),
  //     id: DIFF_SEED,  // Token的随机种子，必须与DIFF_SEED一致
  //     txid: "Txid,mint_tokens",
  //   };

  //   const contextMintToken = {
  //     mint: metadatamint,
  //     destination: to_token_account.address,
  //     payer: payerPair.publicKey,
  //     rent: SYSVAR_RENT_PUBKEY,
  //     systemProgram: SystemProgram.programId,
  //     tokenProgram: TOKEN_PROGRAM_ID,
  //     associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //   };

  //   const txHashMintToken = await program.methods
  //     .mintTokens(mint_tokens_params)
  //     .accounts(contextMintToken)
  //     .signers([payerPair]) // Token创建者的公私钥对
  //     .rpc();
  //   await program.provider.connection.confirmTransaction(txHashMintToken);
  //   console.log(
  //     `  mint token to user https://explorer.solana.com/tx/${txHashMintToken}?cluster=devnet`
  //   );
  // }

  // // --------------------------MintToken End-------------------------------


  // // --------------------------MintToken to User Start-------------------------------
  // {
  //   // mint的代币数量
  //   const mintAmount2 = 100;
  //   // 目标钱包的token账户
  //   const to_token_account2 = await getOrCreateAssociatedTokenAccount(
  //     program.provider.connection,
  //     payerPair,          // 创建账户的付款者
  //     metadatamint,       // Token绑定的Mint地址
  //     UserPair.publicKey // 目标账户的公钥
  //   );
  //   console.log(
  //     "UserPair.publickey:",
  //     UserPair.publicKey,
  //     "to_token_account2.address:",
  //     to_token_account2.address.toBase58()
  //   );

  //   const mint_tokens_params2 = {
  //     quantity: new BN(mintAmount2 * 10 ** metadata.decimals),
  //     id: DIFF_SEED,  // Token的随机种子，必须与DIFF_SEED一致
  //     txid: "Txid,mint_tokens_2",
  //   };

  //   const contextMintToken2 = {
  //     mint: metadatamint,
  //     destination: to_token_account2.address,
  //     payer: payerPair.publicKey,
  //     rent: SYSVAR_RENT_PUBKEY,
  //     systemProgram: SystemProgram.programId,
  //     tokenProgram: TOKEN_PROGRAM_ID,
  //     associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //   };

  //   const txHashMintToken2 = await program.methods
  //     .mintTokens(mint_tokens_params2)
  //     .accounts(contextMintToken2)
  //     .signers([payerPair]) // Token创建者的公私钥对
  //     .rpc();
  //   await program.provider.connection.confirmTransaction(txHashMintToken2);
  //   console.log(
  //     `  mint token to user https://explorer.solana.com/tx/${txHashMintToken2}?cluster=devnet`
  //   );
  // }
  // // --------------------------MintToken to User End-------------------------------
  
  // // --------------------------BurnToken Start ----------------------------
  // {
  //     const [mint, bump] = PublicKey.findProgramAddressSync(
  //       [Buffer.from("mint"), Buffer.from(metadata.id)],
  //       program.programId
  //     );

  //     // 查找要burn的tokenaccount,如果不存在会报错
  //     const payer_token_account = await getAssociatedTokenAddressSync(
  //       metadatamint,       // Token绑定的Mint地址
  //       payerPair.publicKey // tokenAccount所有者的公钥
  //     );

  //     let burnBalance: number;
      
  //     const balance =
  //       (await program.provider.connection.getTokenAccountBalance(
  //         payer_token_account
  //       )).value.uiAmount;
  //     burnBalance = balance! / 2;
  //     console.log("All balance: ", balance, ", burn balance: ", burnBalance);
      

  //     const burn_tokens_params = {
  //       quantity: new BN(burnBalance * 10 ** metadata.decimals),
  //       id: DIFF_SEED,
  //       txid: "Txid,burn_tokens1",
  //     };

  //     const contextBurnToken = {
  //       mint: mint,
  //       tokenAccount: payer_token_account,
  //       payer: payerPair.publicKey,
  //       rent: SYSVAR_RENT_PUBKEY,
  //       systemProgram: SystemProgram.programId,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //     };

  //     const txHash = await program.methods
  //       .burnTokens(burn_tokens_params)
  //       .accounts(contextBurnToken)
  //       .signers([payerPair]) // burn指令的付款者，必须是tokenAccount的所有者
  //       .rpc();
  //     await program.provider.connection.confirmTransaction(txHash);
  //     console.log(`  https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

  //     const postBalance = (
  //       await program.provider.connection.getTokenAccountBalance(
  //         payer_token_account
  //       )
  //     ).value.uiAmount;
  //     console.assert(
  //       burnBalance==postBalance,
  //       "Compare balances, it must be equal"
  //     );
  // }
  // // --------------------------BurnToken End ----------------------------

  // // --------------------------User Burn Token Start ---------------------
  // {
  //   const [mint, bump] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("mint"), Buffer.from(metadata.id)],
  //     program.programId
  //   );

  //   // 查找要burn的tokenaccount,如果不存在会报错
  //   const user_token_account = await getAssociatedTokenAddressSync(
  //     metadatamint,       // Token绑定的Mint地址
  //     UserPair.publicKey // tokenAccount所有者的公钥
  //   );

  //   let burnBalance: number;
    
  //   const balance =
  //       (await program.provider.connection.getTokenAccountBalance(
  //         user_token_account
  //       )).value.uiAmount;
  //     burnBalance = balance! / 2;
    

  //   const burn_tokens_params = {
  //     quantity: new BN(burnBalance * 10 ** metadata.decimals),
  //     id: DIFF_SEED,
  //     txid: "Txid,burn_tokens2",
  //   };

  //   const contextBurnToken = {
  //     mint: mint,
  //     tokenAccount: user_token_account,
  //     payer: UserPair.publicKey,
  //     rent: SYSVAR_RENT_PUBKEY,
  //     systemProgram: SystemProgram.programId,
  //     tokenProgram: TOKEN_PROGRAM_ID,
  //     associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //   };

  //   const txHash = await program.methods
  //     .burnTokens(burn_tokens_params)
  //     .accounts(contextBurnToken)
  //     .signers([UserPair]) // burn指令的付款者，必须是tokenAccount的所有者
  //     .rpc();
  //   await program.provider.connection.confirmTransaction(txHash);
  //   console.log(`  https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

  //   const postBalance = (
  //     await program.provider.connection.getTokenAccountBalance(
  //       user_token_account
  //     )
  //   ).value.uiAmount;
  //   console.assert(
  //     burnBalance==postBalance,
  //     "Compare balances, it must be equal"
  //   );
  // }
  // // --------------------------User Burn Token End ---------------------


  // // --------------------------Buy Token Base Sol from Pool Start -------------------------------
  // {
  //   console.log("\n--------------------------Buy Token Base Sol from Pool Start -----------------------------");
  //    // 其他人的钱包
  //   const noSolPair = Keypair.fromSecretKey(
  //     new Uint8Array([62,120,164,8,63,238,241,180,206,216,0,252,195,5,76,
  //       101,65,193,73,221,235,214,10,244,164,48,57,36,52,135,128,194,183,
  //       69,23,209,200,88,52,165,35,35,23,152,33,249,151,36,23,21,152,148,
  //       129,112,46,218,152,132,46,139,198,173,43,175
  //     ])
  //   );
    
  //   console.log("noSolPair.pubkey:", noSolPair.publicKey.toBase58());
  //   const balance = await solanaConnection.getBalance(noSolPair.publicKey);
  //   console.log(`noSolPair balance: ${balance / LAMPORTS_PER_SOL} SOL`);

  //   const no_sol_token_account = await getOrCreateAssociatedTokenAccount(
  //     program.provider.connection,
  //     payerPair,          // 创建token账户的付款者
  //     metadatamint,       // Token绑定的Mint地址
  //     noSolPair.publicKey, // 目标账户的公钥
  //     true
  //   );

  //   // 购买花费的SOL数量
  //   const buySolAmount = 0.1;
  //   const [poolPda, poolBump] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("pool"), metadatamint.toBuffer()],
  //     program.programId
  //   );
  //   console.log("pool pda:", poolPda.toBase58());

  //   const pool_token_account = await getAssociatedTokenAddressSync(
  //     metadatamint,       // Token绑定的Mint地址
  //     poolPda,             // tokenAccount所有者的公钥
  //     true
  //   );

  //   const [poolSolPda, poolSolBump] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("pool_sol"), metadatamint.toBuffer()],
  //     program.programId
  //   );
  //   console.log("poolSolPda: ", poolSolPda.toBase58());

  //   const buy_tokens_params = {
  //     amount: new BN(buySolAmount * LAMPORTS_PER_SOL),
  //     id: DIFF_SEED,  // Token的随机种子，必须与DIFF_SEED一致
  //     txid: "Txid,buy_tokens_from_pool",
  //   };

  //   const contextBuyToken = {
  //     poolTokenAccount: pool_token_account,
  //     userTokenAccount: no_sol_token_account.address,
  //     poolSolAccount: poolSolPda,
  //     mint: metadatamint,
  //     pool: poolPda,
  //     payer: payerPair.publicKey,         // gas支付账户，同时是mint的创建时的支付账户
  //     buyer: payerPair.publicKey,         // token购买的支付账户
  //     rent: SYSVAR_RENT_PUBKEY,
  //     systemProgram: SystemProgram.programId,
  //     tokenProgram: TOKEN_PROGRAM_ID,
  //     associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //   };

  //   for (let i = 0; i < 100; i++) {
  //     const txHashMintToken = await program.methods
  //     .buyTokensBaseSol(buy_tokens_params)
  //     .accounts(contextBuyToken)
  //     .signers([payerPair]) // Token创建者的公私钥对
  //     .rpc();
  //   }
    
  //   // await program.provider.connection.confirmTransaction(txHashMintToken);
  //   // console.log(
  //   //   `  Buy Token from Pool https://explorer.solana.com/tx/${txHashMintToken}?cluster=devnet`
  //   // );
  // }
  // // --------------------------Buy Token Base Sol from Pool End -------------------------------

  // // --------------------------Buy Token Base Meme from Pool Start -------------------------------
  // {
  //   console.log("\n--------------------------Buy Token Base Meme from Pool Start -----------------------------");
  //    // 其他人的钱包
  //   const noSolPair = Keypair.fromSecretKey(
  //     new Uint8Array([62,120,164,8,63,238,241,180,206,216,0,252,195,5,76,
  //       101,65,193,73,221,235,214,10,244,164,48,57,36,52,135,128,194,183,
  //       69,23,209,200,88,52,165,35,35,23,152,33,249,151,36,23,21,152,148,
  //       129,112,46,218,152,132,46,139,198,173,43,175
  //     ])
  //   );
    
  //   console.log("noSolPair.pubkey:", noSolPair.publicKey.toBase58());
  //   const balance = await solanaConnection.getBalance(noSolPair.publicKey);
  //   console.log(`noSolPair balance: ${balance / LAMPORTS_PER_SOL} SOL`);

  //   const no_sol_token_account = await getOrCreateAssociatedTokenAccount(
  //     program.provider.connection,
  //     payerPair,          // 创建token账户的付款者
  //     metadatamint,       // Token绑定的Mint地址
  //     noSolPair.publicKey, // 目标账户的公钥
  //     true
  //   );

  //   // 购买花费的SOL数量
  //   const buyMemeAmount = 20;
  //   const [poolPda, poolBump] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("pool"), metadatamint.toBuffer()],
  //     program.programId
  //   );
  //   console.log("pool pda:", poolPda.toBase58());

  //   const pool_token_account = await getAssociatedTokenAddressSync(
  //     metadatamint,       // Token绑定的Mint地址
  //     poolPda,             // tokenAccount所有者的公钥
  //     true
  //   );

  //   const buy_tokens_params = {
  //     amount: new BN(buyMemeAmount * LAMPORTS_PER_SOL),
  //     id: DIFF_SEED,  // Token的随机种子，必须与DIFF_SEED一致
  //     txid: "Txid,buy_tokens_from_pool",
  //   };

  //   const contextBuyToken = {
  //     poolTokenAccount: pool_token_account,
  //     destination: no_sol_token_account.address,
  //     mint: metadatamint,
  //     pool: poolPda,
  //     payer: payerPair.publicKey,         // gas支付账户，同时是mint的创建时的支付账户
  //     buyer: payerPair.publicKey,         // token购买的支付账户
  //     rent: SYSVAR_RENT_PUBKEY,
  //     systemProgram: SystemProgram.programId,
  //     tokenProgram: TOKEN_PROGRAM_ID,
  //     associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //   };

  //   const txHashMintToken = await program.methods
  //     .buyTokensBaseMeme(buy_tokens_params)
  //     .accounts(contextBuyToken)
  //     .signers([payerPair]) // Token创建者的公私钥对
  //     .rpc();
  //   await program.provider.connection.confirmTransaction(txHashMintToken);
  //   console.log(
  //     `  Buy Token from Pool https://explorer.solana.com/tx/${txHashMintToken}?cluster=devnet`
  //   );
  // }
  // // --------------------------Buy Token Base Meme from Pool End -------------------------------

  // -------------------------- Sell Token Base on Meme Start -------------------------------
  {
    console.log("\n--------------------------Sell Token Base Sol from Pool Start -----------------------------");
     // 其他人的钱包
    const noSolPair = Keypair.fromSecretKey(
      new Uint8Array([62,120,164,8,63,238,241,180,206,216,0,252,195,5,76,
        101,65,193,73,221,235,214,10,244,164,48,57,36,52,135,128,194,183,
        69,23,209,200,88,52,165,35,35,23,152,33,249,151,36,23,21,152,148,
        129,112,46,218,152,132,46,139,198,173,43,175
      ])
    );
    
    console.log("noSolPair.pubkey:", noSolPair.publicKey.toBase58());
    const balance = await solanaConnection.getBalance(noSolPair.publicKey);
    console.log(`noSolPair balance: ${balance / LAMPORTS_PER_SOL} SOL`);

    const no_sol_token_account = await getOrCreateAssociatedTokenAccount(
      program.provider.connection,
      payerPair,          // 创建token账户的付款者
      metadatamint,       // Token绑定的Mint地址
      noSolPair.publicKey, // 目标账户的公钥
      true
    );

    // 购买花费的SOL数量
    const sellMemeAmount = 5;
    const [poolPda, poolBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool"), metadatamint.toBuffer()],
      program.programId
    );


    const [poolSolPda, poolSolBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool_sol"), metadatamint.toBuffer()],
      program.programId
    );

    console.log("poolpda:", poolPda.toBase58(), "poolSolPda", poolSolPda.toBase58());

    const pool_token_account = await getAssociatedTokenAddressSync(
      metadatamint,       // Token绑定的Mint地址
      poolPda,             // tokenAccount所有者的公钥
      true
    );

    const sell_tokens_params = {
      amount: new BN(sellMemeAmount * LAMPORTS_PER_SOL),
      id: DIFF_SEED,  // Token的随机种子，必须与DIFF_SEED一致
      txid: "Txid,buy_tokens_from_pool",
    };

    const contextSellToken = {
      poolTokenAccount: pool_token_account,
      userTokenAccount: no_sol_token_account.address,
      poolSolAccount: poolSolPda,
      payee: payerPair.publicKey,
      mint: metadatamint,
      pool: poolPda,
      payer: payerPair.publicKey,         // gas支付账户，同时是mint的创建时的支付账户
      seller: noSolPair.publicKey,         // token购买的支付账户
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    };

    for (let i = 0; i < 100; i++) {
      const txHashMintToken = await program.methods
      .sellTokensBaseMeme(sell_tokens_params)
      .accounts(contextSellToken)
      .signers([payerPair, noSolPair]) // Token创建者的公私钥对
      .rpc();
    }
  }
  // -------------------------- Sell Token Base on Meme End -------------------------------
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