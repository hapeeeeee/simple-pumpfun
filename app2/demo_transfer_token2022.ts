import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction, } from '@solana/web3.js';
import {
  createMint,
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  createTransferInstruction,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  ExtensionType,
  getMintLen,
  createInitializeTransferFeeConfigInstruction,
  createInitializeMintInstruction,
  getAccount,
} from "@solana/spl-token";
import {
  tmpPayerPair,
  getAuthAddress,
  getPoolAddress,
  getPoolLpMintAddress,
  getPoolVaultAddress,
  createMintWithTransferFee,
  getOrcleAccountAddress,
  getAmmConfigAddress,
} from "./utils";
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();
(async () => {
  const connection = new Connection("https://devnet.helius-rpc.com/?api-key=0e4875a4-435d-4013-952a-1f82e3715f09", {
    commitment: 'confirmed'
  });
  const keypairPath = `${process.env.HOME}/.config/solana/id.json`;
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
  const fromKeypair = Keypair.fromSecretKey(new Uint8Array(keypairData));

  const to_wallet = Keypair.fromSecretKey(
    new Uint8Array([
      32, 170, 209, 222, 174, 15, 95, 191, 172, 227, 88, 30, 88, 72, 98, 206, 41,
      50, 136, 153, 216, 242, 228, 19, 241, 25, 73, 77, 47, 144, 141, 97, 118, 55,
      87, 164, 98, 183, 171, 93, 52, 11, 121, 253, 165, 110, 122, 149, 176, 102,
      212, 124, 26, 244, 7, 192, 170, 150, 88, 178, 194, 166, 96, 191,
    ])
  );
  const toAddr = to_wallet.publicKey;

  // let token0 = await createMintWithTransferFee(
  //   connection,
  //   fromKeypair,
  //   tmpPayerPair,
  //   Keypair.generate(),
  //   {
  //     transferFeeBasisPoints: 0,
  //     MaxFee: 0,
  //   }
  // );
  let token0 = await createMint(
    connection,
    fromKeypair,
    tmpPayerPair.publicKey,
    tmpPayerPair.publicKey,
    9,
    Keypair.generate(),
    null,
    TOKEN_2022_PROGRAM_ID,
  );

  const ownerToken0Account = await getOrCreateAssociatedTokenAccount(
    connection,
    fromKeypair,
    token0,
    fromKeypair.publicKey,
    false,
    "processed",
    { skipPreflight: true },
    TOKEN_2022_PROGRAM_ID
  );

  await mintTo(
    connection,
    fromKeypair,
    token0,
    ownerToken0Account.address,
    tmpPayerPair,
    100_000_000_000_000,
    [],
    { skipPreflight: true },
    TOKEN_2022_PROGRAM_ID
  );

  console.info(token0);
  // tokenArray.push({ address: token0, program: TOKEN_2022_PROGRAM_ID });
  // const usdcMint = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");
  const lamportsToSend = 1_000_000;
  // Amount to send (1 USDC in this case, as USDC has 6 decimals)
  // const fromTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromKeypair, tmpPayerPair.publicKey, fromKeypair.publicKey);
  // const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromKeypair, tmpPayerPair.publicKey, toAddr);
  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection, fromKeypair, token0, fromKeypair.publicKey, false,
    "processed",
    { skipPreflight: true },
    TOKEN_2022_PROGRAM_ID
  );
  const toTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection, fromKeypair, token0, toAddr, false,
    "processed",
    { skipPreflight: true },
    TOKEN_2022_PROGRAM_ID
  );

  const transfer = createTransferInstruction(
    fromTokenAccount.address,
    toTokenAccount.address,
    fromKeypair.publicKey,
    lamportsToSend,
    [],
    TOKEN_2022_PROGRAM_ID
  );
  const transferTransaction = new Transaction().add(transfer);
  const txhash = await sendAndConfirmTransaction(connection, transferTransaction, [fromKeypair,]);
  console.info(txhash);
})();
