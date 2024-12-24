import * as anchor from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";
import assert from "assert";
import BN from "bn.js";
import { Spl } from "../target/types/spl";

const payerPair = web3.Keypair.fromSecretKey(
  new Uint8Array([
    203, 167, 69, 177, 11, 31, 89, 175, 115, 48, 165, 211, 252, 68, 104, 115, 1,
    105, 35, 88, 95, 130, 94, 201, 230, 101, 183, 53, 147, 220, 81, 124, 22,
    159, 194, 135, 43, 204, 30, 103, 174, 167, 82, 123, 164, 91, 140, 50, 31,
    126, 126, 115, 63, 33, 87, 219, 86, 67, 172, 210, 181, 57, 241, 219,
  ])
);

const DIFF_SEED = "3Zax3";

describe("spl program test", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Spl as anchor.Program<Spl>;

  const METADATA_SEED = "metadata";
  const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  const MINT_SEED = DIFF_SEED;
  const payer = program.provider.publicKey;
  const metadata = {
    name: DIFF_SEED,
    symbol: DIFF_SEED,
    uri: "https://arweave.net/Xjqaj_rYYQGrsiTk9JRqpguA813w6NGPikcRyA1vAHM",
    decimals: 9,
    id: DIFF_SEED,
  };
  const mintAmount = 10;

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

  it("Initialize", async () => {
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
    const newInfo = await program.provider.connection.getAccountInfo(mint);
    assert(newInfo, "  Mint should be initialized.");
  });

  it("mint tokens", async () => {
    const destination = await anchor.utils.token.associatedAddress({
      mint: mint,
      owner: payer,
    });

    let initialBalance: number;

    try {
      const balance = await program.provider.connection.getTokenAccountBalance(
        destination
      );
      initialBalance = balance.value.uiAmount;
    } catch {
      // Token account not yet initiated has 0 balance
      initialBalance = 0;
    }

    const mint_tokens_params = {
      quantity: new BN(mintAmount * 10 ** metadata.decimals),
      id: DIFF_SEED,
    };

    const context = {
      mint,
      destination,
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
    console.log(`  https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

    const postBalance = (
      await program.provider.connection.getTokenAccountBalance(destination)
    ).value.uiAmount;
    assert.equal(
      initialBalance + mintAmount,
      postBalance,
      "Compare balances, it must be equal"
    );
  });

  it("burn tokens", async () => {
    const token_account = await anchor.utils.token.associatedAddress({
      mint: mint,
      owner: payer,
    });

    let burnBalance: number;

    try {
      const balance = await program.provider.connection.getTokenAccountBalance(
        token_account
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
      tokenAccount: token_account,
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

    const postBalance = (
      await program.provider.connection.getTokenAccountBalance(token_account)
    ).value.uiAmount;
    assert.equal(
      burnBalance,
      postBalance,
      "Compare balances, it must be equal"
    );
  });
});
