import * as anchor from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";
import assert from "assert";
import BN from "bn.js";
import { getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Spl } from "../target/types/spl";

const payerPair = web3.Keypair.fromSecretKey(
  new Uint8Array([
    203, 167, 69, 177, 11, 31, 89, 175, 115, 48, 165, 211, 252, 68, 104, 115, 1,
    105, 35, 88, 95, 130, 94, 201, 230, 101, 183, 53, 147, 220, 81, 124, 22,
    159, 194, 135, 43, 204, 30, 103, 174, 167, 82, 123, 164, 91, 140, 50, 31,
    126, 126, 115, 63, 33, 87, 219, 86, 67, 172, 210, 181, 57, 241, 219,
  ])
);

const DIFF_SEED = "ddddd";

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
  assert(payerPair.publicKey.equals(payer), "payerPair.pubkey != payer");

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
        .createToken(metadata)
        .accounts(context)
        .signers([])
        .rpc();

      await program.provider.connection.confirmTransaction(txHash, "finalized");
      console.log(`  https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

      // This line is only for test purposes to ensure the event
      // listener has time to listen to event.
      // sleep(50000);
      program.removeEventListener(listenerCreateToken);
    } catch (error) {
      console.log("create token", error);
    }
  });

  it("mint tokens to payer", async () => {
    try {
      const listenerMintToken = program.addEventListener(
        "EVENTMintToken",
        (event, slot) => {
          console.log(
            `EVENTMintToken: name = ${event.tokenAccount.toBase58()},amount = ${
              event.amount
            }`
          );
        }
      );

      const [mint, bump] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("mint"), Buffer.from(metadata.id)],
        program.programId
      );

      const to_token_account = await getOrCreateAssociatedTokenAccount(
        program.provider.connection,
        payerPair,
        mint,
        payer
      );
      console.log(
        "to_token_account.address:",
        to_token_account.address.toBase58()
      );

      const mint_tokens_params = {
        quantity: new BN(mintAmount * 10 ** metadata.decimals),
        id: DIFF_SEED,
      };

      const context = {
        mint,
        destination: to_token_account.address,
        payer,
        rent: web3.SYSVAR_RENT_PUBKEY,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
      };

      const txHash = await program.methods
        .mintTokens(mint_tokens_params)
        .accounts(context)
        .rpc();
      await program.provider.connection.confirmTransaction(txHash);
      console.log(
        `  mint token to user https://explorer.solana.com/tx/${txHash}?cluster=devnet`
      );

      // sleep(50000);
      program.removeEventListener(listenerMintToken);

      const postBalance = (
        await program.provider.connection.getTokenAccountBalance(
          to_token_account.address
        )
      ).value.uiAmount;
      assert.equal(
        mintAmount,
        postBalance,
        "Compare balances, it must be equal"
      );
    } catch (error) {
      console.log("  mint tokens to payer error", error);
    }
  });

  it("payer burn tokens", async () => {
    try {
      const listenerBurnToken = program.addEventListener(
        "EVENTBurnToken",
        (event, slot) => {
          console.log(
            `EVENTBurnToken: name = ${event.tokenAccount.toBase58()},amount = ${
              event.amount
            }`
          );
        }
      );

      const [mint, bump] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("mint"), Buffer.from(metadata.id)],
        program.programId
      );

      const payer_token_account = await anchor.utils.token.associatedAddress({
        mint: mint,
        owner: payer,
      });

      let burnBalance: number;

      try {
        const balance =
          await program.provider.connection.getTokenAccountBalance(
            payer_token_account
          );
        burnBalance = balance.value.uiAmount / 2;
        console.log("balance: ", balance);
      } catch {
        // Token account not yet initiated has 0 balance
        burnBalance = 0;
      }

      const burn_tokens_params = {
        quantity: new BN(burnBalance * 10 ** metadata.decimals),
        id: DIFF_SEED,
      };

      const context = {
        mint: mint,
        tokenAccount: payer_token_account,
        payer: payer,
        rent: web3.SYSVAR_RENT_PUBKEY,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
      };

      const txHash = await program.methods
        .burnTokens(burn_tokens_params)
        .accounts(context)
        .signers([payerPair])
        .rpc();
      await program.provider.connection.confirmTransaction(txHash);
      console.log(`  https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

      // sleep(50000);
      program.removeEventListener(listenerBurnToken);

      const postBalance = (
        await program.provider.connection.getTokenAccountBalance(
          payer_token_account
        )
      ).value.uiAmount;
      assert.equal(
        burnBalance,
        postBalance,
        "Compare balances, it must be equal"
      );
    } catch (error) {
      console.log("  burn token error", error);
    }
  });

  // it("create pool", async () => {
  //   const configAddress = new PublicKey(
  //     "D4FPEruKEHrG5TenZ2mpDGEfu1iUvTiqBxvpU8HLBvC2"
  //   );
  //   const [mint, bump] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("mint"), Buffer.from(metadata.id)],
  //     program.programId
  //   );

  //   const token0 = await anchor.utils.token.associatedAddress({
  //     mint: mint,
  //     owner: payer,
  //   });
  //   // token0Program = TOKEN_PROGRAM_ID;
  //   // token1 =
  //   const token1Program = new web3.PublicKey("So11111111111111111111111111111111111111112");
  
  
  //   const initAmount0 = new BN(10000000000);
  //   const initAmount1 = new BN(10000000000);
  //   const { poolAddress, cpSwapPoolState, tx } = await initialize(
  //     program,
  //     owner,
  //     configAddress,
  //     token0,
  //     token0Program,
  //     token1,
  //     token1Program,
  //     confirmOptions,
  //     { initAmount0, initAmount1 }
  //   );

  //   console.log("pool address: ", poolAddress.toString(), " tx:", tx);
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
});
