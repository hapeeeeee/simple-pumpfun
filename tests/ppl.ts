import * as anchor from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";
import assert from "assert";
import BN from "bn.js";
import { Spl } from "../target/types/spl";

const payerPair = web3.Keypair.fromSecretKey(
  new Uint8Array([
    32, 170, 209, 222, 174, 15, 95, 191, 172, 227, 88, 30, 88, 72, 98, 206, 41,
    50, 136, 153, 216, 242, 228, 19, 241, 25, 73, 77, 47, 144, 141, 97, 118, 55,
    87, 164, 98, 183, 171, 93, 52, 11, 121, 253, 165, 110, 122, 149, 176, 102,
    212, 124, 26, 244, 7, 192, 170, 150, 88, 178, 194, 166, 96, 191,
  ])
);

const DIFF_SEED = "MMM";

describe("spl program test", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Spl as anchor.Program<Spl>;

  const fee = 10;
  const METADATA_SEED = "metadata";
  const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  const MINT_SEED = DIFF_SEED;
  const payer = program.provider.publicKey;
  assert(payerPair.publicKey.equals(payer));

  const metadata = {
    name: DIFF_SEED,
    symbol: DIFF_SEED,
    uri: "https://arweave.net/Xjqaj_rYYQGrsiTk9JRqpguA813w6NGPikcRyA1vAHM",
    decimals: 9,
    id: DIFF_SEED,
  };
  const mintAmount = 10;
  const tranferAmount = 4;

  const [mint, bump] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("mint"), Buffer.from(metadata.id)],
    program.programId
  );
  console.log("mint address: ", mint.toBase58());
  const [metadataAddress] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from(METADATA_SEED),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  // it("initalize config", async () => {
  //   try {
  //     // const listenerInitializeEvent = program.addEventListener('EVENT_initialize', (event, slot) => {
  //     //   console.log(`lister EVENT_initialize: config address = ${event.dex_configuration_account.toBase58()},fee = ${event.fee}`);
  //     // });

  //     const [curveConfig] = web3.PublicKey.findProgramAddressSync(
  //       [Buffer.from("config")],
  //       program.programId
  //     );

  //     const context = {
  //       dexConfigurationAccount: curveConfig,
  //       admin: payer,
  //       rent: web3.SYSVAR_RENT_PUBKEY,
  //       systemProgram: web3.SystemProgram.programId,
  //     };

  //     const txHash = await program.methods
  //       .initialize(fee)
  //       .accounts(context)
  //       .rpc();

  //     // // This line is only for test purposes to ensure the event
  //     // // listener has time to listen to event.
  //     // await new Promise((resolve) => setTimeout(resolve, 5000));
  //     // program.removeEventListener(listenerInitializeEvent);
  //   } catch (error) {
  //     console.log("initalize config token", error);
  //   }
  // });

  it("create token", async () => {
    try {
      const listenerCreateToken = program.addEventListener(
        "EVENTCreateToken",
        (event, slot) => {
          console.log(
            `EVENTCreateToken: name = ${event.name},symbol = ${event.symbol}`
          );
        }
      );

      const info = await program.provider.connection.getAccountInfo(mint);
      if (info) {
        return; // Do not attempt to initialize if already initialized
      }
      console.log("  Mint not found. Initializing Program...");

      const context = {
        metadata: metadataAddress,
        mint,
        payer,
        rent: web3.SYSVAR_RENT_PUBKEY,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      };

      const txHash = await program.methods
        .initiateToken(metadata)
        .accounts(context)
        .signers([])
        .rpc();

      await program.provider.connection.confirmTransaction(txHash, "finalized");
      console.log(`  https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

      // This line is only for test purposes to ensure the event
      // listener has time to listen to event.
      sleep(5000);
      program.removeEventListener(listenerCreateToken);
    } catch (error) {
      console.log("create token", error);
    }
  });

  it("create pool", async () => {
    try {
      const listenerCreatePool = program.addEventListener(
        "EVENTCreatePool",
        (event, slot) => {
          console.log(
            `EVENTCreatePool: creator = ${event.creator.toBase58()},fee = ${event.mint.toBase58()}`
          );
        }
      );

      const [mint, bump] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("mint"), Buffer.from(metadata.id)],
        program.programId
      );

      const [poolPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), mint.toBuffer()],
        program.programId
      );

      const pool_token_account = await anchor.utils.token.associatedAddress({
        mint: mint,
        owner: poolPda,
      });

      const info = await program.provider.connection.getAccountInfo(poolPda);
      if (info) {
        return; // Do not attempt to initialize if already initialized
      }
      console.log("  poolPda not found. createing pool...");
      console.log("  mint:", mint.toBase58());
      console.log("  poolPda:", poolPda.toBase58());
      console.log("  pool_token_account:", pool_token_account.toBase58());
      const context = {
        pool: poolPda,
        mint,
        poolTokenAccount: pool_token_account,
        payer,
        rent: web3.SYSVAR_RENT_PUBKEY,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      };

      const txHash = await program.methods
        .createPool()
        .accounts(context)
        .signers([payerPair])
        .rpc();

      await program.provider.connection.confirmTransaction(txHash, "finalized");
      console.log(`  https://explorer.solana.com/tx/${txHash}?cluster=devnet`);
      // sleep(5000);
      program.removeEventListener(listenerCreatePool);
      // assert(newInfo, "  Mint should be initialized.");
    } catch (error) {
      console.log("  create pool error", error);
    }
  });

  // it("mint tokens to pool", async () => {
  //   try {
  //     const [mint, bump] = web3.PublicKey.findProgramAddressSync(
  //       [Buffer.from("mint"), Buffer.from(metadata.id)],
  //       program.programId
  //     );

  //     const [poolPda] = web3.PublicKey.findProgramAddressSync(
  //       [Buffer.from("pool"), mint.toBuffer()],
  //       program.programId
  //     );

  //     const pool_token_account = await anchor.utils.token.associatedAddress({
  //       mint: mint,
  //       owner: poolPda,
  //     });

  //     let initialBalance: number;

  //     try {
  //       const balance =
  //         await program.provider.connection.getTokenAccountBalance(
  //           pool_token_account
  //         );
  //       initialBalance = balance.value.uiAmount;
  //     } catch {
  //       // Token account not yet initiated has 0 balance
  //       initialBalance = 0;
  //     }
  //     console.log("  mint tokens initialBalance = ", initialBalance);
  //     const mint_tokens_params = {
  //       quantity: new BN(mintAmount * 10 ** metadata.decimals),
  //       id: DIFF_SEED,
  //     };

  //     const context = {
  //       mint,
  //       pool: poolPda,
  //       destination: pool_token_account,
  //       payer,
  //       rent: web3.SYSVAR_RENT_PUBKEY,
  //       systemProgram: web3.SystemProgram.programId,
  //       tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
  //       associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
  //     };

  //     const txHash = await program.methods
  //       .mintTokensToPool(mint_tokens_params)
  //       .accounts(context)
  //       .rpc();
  //     await program.provider.connection.confirmTransaction(txHash);
  //     console.log(
  //       `  mint token to pool https://explorer.solana.com/tx/${txHash}?cluster=devnet`
  //     );

  //     const postBalance = (
  //       await program.provider.connection.getTokenAccountBalance(
  //         pool_token_account
  //       )
  //     ).value.uiAmount;
  //     assert.equal(
  //       initialBalance + mintAmount,
  //       postBalance,
  //       "Compare balances, it must be equal"
  //     );
  //   } catch (error) {
  //     console.log("  mint tokens to pool error", error);
  //   }
  // });

  // it("tranfer tokens to user", async () => {
  //   try {
  //     const [mint, bump] = web3.PublicKey.findProgramAddressSync(
  //       [Buffer.from("mint"), Buffer.from(metadata.id)],
  //       program.programId
  //     );

  //     const [poolPda] = web3.PublicKey.findProgramAddressSync(
  //       [Buffer.from("pool"), mint.toBuffer()],
  //       program.programId
  //     );

  //     const pool_token_account = await anchor.utils.token.associatedAddress({
  //       mint: mint,
  //       owner: poolPda,
  //     });

  //     const payer_token_account = await anchor.utils.token.associatedAddress({
  //       mint: mint,
  //       owner: payer,
  //     });

  //     console.log("  tranfer 4 token to user ");
  //     // const tra_tokens_params = {
  //     //   quantity: new BN(4 * 10 ** metadata.decimals),
  //     //   id: DIFF_SEED,
  //     // };

  //     const context = {
  //       pool: poolPda,
  //       mint,
  //       poolTokenAccount: pool_token_account,
  //       payerTokenAccount: payer_token_account,
  //       payer,
  //       rent: web3.SYSVAR_RENT_PUBKEY,
  //       systemProgram: web3.SystemProgram.programId,
  //       tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
  //       associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
  //     };

  //     const txHash = await program.methods
  //       .transferTokens(new BN(tranferAmount * 10 ** metadata.decimals))
  //       .accounts(context)
  //       .signers([])
  //       .rpc();
  //     await program.provider.connection.confirmTransaction(txHash);
  //     console.log(
  //       `  transfer https://explorer.solana.com/tx/${txHash}?cluster=devnet`
  //     );

  //     const postBalance = (
  //       await program.provider.connection.getTokenAccountBalance(
  //         pool_token_account
  //       )
  //     ).value.uiAmount;
  //     assert.equal(
  //       mintAmount - tranferAmount,
  //       postBalance,
  //       "Compare balances, it must be equal"
  //     );

  //     const postBalance2 = (
  //       await program.provider.connection.getTokenAccountBalance(
  //         payer_token_account
  //       )
  //     ).value.uiAmount;
  //     assert.equal(
  //       tranferAmount,
  //       postBalance2,
  //       "Compare balances, it must be equal"
  //     );
  //   } catch (error) {
  //     console.log("  transfer to user error", error);
  //   }
  // });

  // it("burn tokens", async () => {
  //   try {
  //     const [mint, bump] = web3.PublicKey.findProgramAddressSync(
  //       [Buffer.from("mint"), Buffer.from(metadata.id)],
  //       program.programId
  //     );

  //     const [poolPda] = web3.PublicKey.findProgramAddressSync(
  //       [Buffer.from("pool"), mint.toBuffer()],
  //       program.programId
  //     );

  //     const payer_token_account = await anchor.utils.token.associatedAddress({
  //       mint: mint,
  //       owner: payer,
  //     });

  //     let burnBalance: number;

  //     try {
  //       const balance =
  //         await program.provider.connection.getTokenAccountBalance(
  //           payer_token_account
  //         );
  //       burnBalance = balance.value.uiAmount / 2;
  //       console.log("balance: ", balance);
  //     } catch {
  //       // Token account not yet initiated has 0 balance
  //       burnBalance = 0;
  //     }

  //     const burn_tokens_params = {
  //       quantity: new BN(burnBalance * 10 ** metadata.decimals),
  //       id: DIFF_SEED,
  //     };

  //     const context = {
  //       mint: mint,
  //       pool: poolPda,
  //       tokenAccount: payer_token_account,
  //       payer: payer,
  //       rent: web3.SYSVAR_RENT_PUBKEY,
  //       systemProgram: web3.SystemProgram.programId,
  //       tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
  //       associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
  //     };

  //     const txHash = await program.methods
  //       .burnTokens(burn_tokens_params)
  //       .accounts(context)
  //       .signers([payerPair])
  //       .rpc();
  //     await program.provider.connection.confirmTransaction(txHash);
  //     console.log(`  https://explorer.solana.com/tx/${txHash}?cluster=devnet`);
  //     const postBalance = (
  //       await program.provider.connection.getTokenAccountBalance(
  //         payer_token_account
  //       )
  //     ).value.uiAmount;
  //     assert.equal(
  //       burnBalance,
  //       postBalance,
  //       "Compare balances, it must be equal"
  //     );
  //   } catch (error) {
  //     console.log("  burn token error", error);
  //   }
  // });
});
