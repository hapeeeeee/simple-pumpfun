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
    new Uint8Array([
      32, 170, 209, 222, 174, 15, 95, 191, 172, 227, 88, 30, 88, 72, 98, 206, 41,
      50, 136, 153, 216, 242, 228, 19, 241, 25, 73, 77, 47, 144, 141, 97, 118, 55,
      87, 164, 98, 183, 171, 93, 52, 11, 121, 253, 165, 110, 122, 149, 176, 102,
      212, 124, 26, 244, 7, 192, 170, 150, 88, 178, 194, 166, 96, 191,
    ])
  );
  
  // 付款者的公钥和SOL数量
  console.log("My address:", payerPair.publicKey.toString());
  const balance = await solanaConnection.getBalance(payerPair.publicKey);
  console.log(`My balance: ${balance / LAMPORTS_PER_SOL} SOL`);

  // 其他人的钱包
  const UserPair = Keypair.fromSecretKey(
    new Uint8Array([
      226,97,180,197,27,45,237,66,49,183,63,63,
      102,86,218,20,84,99,117,157,85,113,201,55,74,13,181,155,174,58,230,20,18,
      20,225,239,146,63,30,80,205,205,105,136,172,176,69,167,112,77,197,
      163,195,26,1,35,28,5,173,166,159,110,14,89
    ])
  );
  

  // 部署在链上的合约地址
  const smart_comtract_address = "EaHoDFV3PCwUEFjU6b5U4Y76dW5oP7Bu1ndga8WgksFU";

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
        `EVENTCreateToken: id = ${event.tokenId}, name = ${event.name},symbol = ${event.symbol}`
      );

      const block = await solanaConnection.getBlock(slot, {"maxSupportedTransactionVersion": 0});
      if (block != undefined) {
        block.transactions.forEach(tx => {
          console.log('Transaction Hash:', tx.transaction.signatures[0]);
        });
      }
    }
  );

  // 创建Mint函数监听器
  const listenerMintToken = program.addEventListener(
    "EVENTMintToken",
    (event, slot) => {
      // console.log(
      //   `EVENTMintToken: id= ${event.tokenId}, dest_token_account = ${event.tokenAccount.toBase58()},amount = ${
      //     event.amount
      //   }`
      // );
      // console.log(`EVENTMintToken event: ${event}`);
      console.log(JSON.stringify(event, null, 2));

      console.log(`EVENTMintToken slot: ${slot}`);
    }
  );

  // 创建burn函数监听器
  const listenerBurnToken = program.addEventListener(
    "EVENTBurnToken",
    (event, slot) => {
      console.log(
        `EVENTBurnToken: id= ${event.tokenId},token_account = ${event.tokenAccount.toBase58()},amount = ${
          event.amount
        }`
      );
    }
  );
  
  
  
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s" // 官方提供的API程序
  );



  // 代币的随机种子和描述信息
  const DIFF_SEED = "LLLL";
  const metadata = {
    name: DIFF_SEED,  // 代币名字
    symbol: DIFF_SEED,  // 
    uri: "https://arweave.net/Xjqaj_rYYQGrsiTk9JRqpguA813w6NGPikcRyA1vAHM",
    decimals: 9,
    id: DIFF_SEED,  // 代币ID，必须与随机种子一致！！！！
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
  }
  // --------------------------CreateToken End-------------------------------


  // --------------------------MintToken Start-------------------------------
  {
    // const [mint, bump] = web3.PublicKey.findProgramAddressSync(
    //   [Buffer.from("mint"), Buffer.from(metadata.id)],
    //   program.programId
    // );

    // mint的代币数量
    const mintAmount = 100;
    // 目标钱包的token账户
    const to_token_account = await getOrCreateAssociatedTokenAccount(
      program.provider.connection,
      payerPair,          // 创建token账户的付款者
      metadatamint,       // Token绑定的Mint地址
      payerPair.publicKey // 目标账户的公钥
    );
    console.log(
      "to_token_account.address:",
      to_token_account.address.toBase58()
    );

    const mint_tokens_params = {
      quantity: new BN(mintAmount * 10 ** metadata.decimals),
      id: DIFF_SEED,  // Token的随机种子，必须与DIFF_SEED一致
    };

    const contextMintToken = {
      mint: metadatamint,
      destination: to_token_account.address,
      payer: payerPair.publicKey,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    };

    const txHashMintToken = await program.methods
      .mintTokens(mint_tokens_params)
      .accounts(contextMintToken)
      .signers([payerPair]) // Token创建者的公私钥对
      .rpc();
    await program.provider.connection.confirmTransaction(txHashMintToken);
    console.log(
      `  mint token to user https://explorer.solana.com/tx/${txHashMintToken}?cluster=devnet`
    );
  }

  // --------------------------MintToken End-------------------------------


  // --------------------------MintToken to User Start-------------------------------
  {
    // mint的代币数量
    const mintAmount2 = 100;
    // 目标钱包的token账户
    const to_token_account2 = await getOrCreateAssociatedTokenAccount(
      program.provider.connection,
      payerPair,          // 创建账户的付款者
      metadatamint,       // Token绑定的Mint地址
      UserPair.publicKey // 目标账户的公钥
    );
    console.log(
      "UserPair.publickey:",
      UserPair.publicKey,
      "to_token_account2.address:",
      to_token_account2.address.toBase58()
    );

    const mint_tokens_params2 = {
      quantity: new BN(mintAmount2 * 10 ** metadata.decimals),
      id: DIFF_SEED,  // Token的随机种子，必须与DIFF_SEED一致
    };

    const contextMintToken2 = {
      mint: metadatamint,
      destination: to_token_account2.address,
      payer: payerPair.publicKey,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    };

    const txHashMintToken2 = await program.methods
      .mintTokens(mint_tokens_params2)
      .accounts(contextMintToken2)
      .signers([payerPair]) // Token创建者的公私钥对
      .rpc();
    await program.provider.connection.confirmTransaction(txHashMintToken2);
    console.log(
      `  mint token to user https://explorer.solana.com/tx/${txHashMintToken2}?cluster=devnet`
    );
  }
  // --------------------------MintToken to User End-------------------------------
  
  // --------------------------BurnToken Start ----------------------------
  {
      const [mint, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from("mint"), Buffer.from(metadata.id)],
        program.programId
      );

      // 查找要burn的tokenaccount,如果不存在会报错
      const payer_token_account = await getAssociatedTokenAddressSync(
        metadatamint,       // Token绑定的Mint地址
        payerPair.publicKey // tokenAccount所有者的公钥
      );

      let burnBalance: number;
      
      const balance =
        (await program.provider.connection.getTokenAccountBalance(
          payer_token_account
        )).value.uiAmount;
      burnBalance = balance! / 2;
      console.log("All balance: ", balance, ", burn balance: ", burnBalance);
      

      const burn_tokens_params = {
        quantity: new BN(burnBalance * 10 ** metadata.decimals),
        id: DIFF_SEED,
      };

      const contextBurnToken = {
        mint: mint,
        tokenAccount: payer_token_account,
        payer: payerPair.publicKey,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      };

      const txHash = await program.methods
        .burnTokens(burn_tokens_params)
        .accounts(contextBurnToken)
        .signers([payerPair]) // burn指令的付款者，必须是tokenAccount的所有者
        .rpc();
      await program.provider.connection.confirmTransaction(txHash);
      console.log(`  https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

      const postBalance = (
        await program.provider.connection.getTokenAccountBalance(
          payer_token_account
        )
      ).value.uiAmount;
      console.assert(
        burnBalance==postBalance,
        "Compare balances, it must be equal"
      );
  }
  // --------------------------BurnToken End ----------------------------

  // --------------------------User Burn Token Start ---------------------
  {
    const [mint, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), Buffer.from(metadata.id)],
      program.programId
    );

    // 查找要burn的tokenaccount,如果不存在会报错
    const user_token_account = await getAssociatedTokenAddressSync(
      metadatamint,       // Token绑定的Mint地址
      UserPair.publicKey // tokenAccount所有者的公钥
    );

    let burnBalance: number;
    
    const balance =
        (await program.provider.connection.getTokenAccountBalance(
          user_token_account
        )).value.uiAmount;
      burnBalance = balance! / 2;
    

    const burn_tokens_params = {
      quantity: new BN(burnBalance * 10 ** metadata.decimals),
      id: DIFF_SEED,
    };

    const contextBurnToken = {
      mint: mint,
      tokenAccount: user_token_account,
      payer: UserPair.publicKey,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    };

    const txHash = await program.methods
      .burnTokens(burn_tokens_params)
      .accounts(contextBurnToken)
      .signers([UserPair]) // burn指令的付款者，必须是tokenAccount的所有者
      .rpc();
    await program.provider.connection.confirmTransaction(txHash);
    console.log(`  https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

    const postBalance = (
      await program.provider.connection.getTokenAccountBalance(
        user_token_account
      )
    ).value.uiAmount;
    console.assert(
      burnBalance==postBalance,
      "Compare balances, it must be equal"
    );
}
  // --------------------------User Burn Token End ---------------------

  program.removeEventListener(listenerCreateToken);
  program.removeEventListener(listenerMintToken);
  program.removeEventListener(listenerBurnToken);
}

main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  },
);
// async function getTokenAccounts(wallet, solanaConnection) {
//     const filters = [
//         {
//           dataSize: 165,    // size of account (bytes)
//         },
//         {
//           memcmp: {
//             offset: 32,     // location of our query in the account (bytes)
//             bytes: wallet,  // our search criteria, a base58 encoded string
//           },            
//         }];
//     const accounts = await solanaConnection.getParsedProgramAccounts(
//         TOKEN_PROGRAM_ID, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
//         {filters: filters}
//     );
//     console.log(`Found ${accounts.length} token account(s) for wallet ${wallet}.`);
//     const tokenList = await getTokenRegistry();
//     accounts.forEach((account, i) => {
//         // Parse the account data
//         const parsedAccountInfo = account.account.data;
//         const mintAddress = parsedAccountInfo["parsed"]["info"]["mint"];
//         const tokenBalance = parsedAccountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"];
//         // Find this token in the Token Registry
//         const tokenName = tokenList.find(token=>token.address === mintAddress);
//         // Log results
//         console.log(`Token Account No. ${i + 1}: ${account.pubkey.toString()}`);
//         console.log(`--Token Mint: ${mintAddress}`);
//         if(tokenName) {console.log(`--Name: ${tokenName.name}`)}
//         console.log(`--Token Balance: ${tokenBalance}`);
//     });
// }
// getTokenAccounts(walletToQuery, solanaConnection);