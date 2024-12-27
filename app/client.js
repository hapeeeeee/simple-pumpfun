"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const anchor_1 = require("@coral-xyz/anchor");
const fs_1 = __importDefault(require("fs"));
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const hpagent_1 = require("hpagent");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const proxy = "http://127.0.0.1:7890";
const proxyAgent = new hpagent_1.HttpsProxyAgent({ proxy });
const solanaConnection = new web3_js_1.Connection("https://devnet.helius-rpc.com/?api-key=0e4875a4-435d-4013-952a-1f82e3715f09", {
    commitment: 'confirmed',
    // fetch: async (input, options) => {
    //   const processedInput =
    //   typeof input === 'string' && input.slice(0, 2) === '//'
    //     ? 'https:' + input
    //     : input;    
    //   const result = await fetch(processedInput, {
    //     ...options,
    //     agent: proxyAgent,
    //   });
    //   log('RESPONSE STATUS', result.status);
    //   return result;
    // },
});
async function main() {
    const payerPair = web3_js_1.Keypair.fromSecretKey(new Uint8Array([
        32, 170, 209, 222, 174, 15, 95, 191, 172, 227, 88, 30, 88, 72, 98, 206, 41,
        50, 136, 153, 216, 242, 228, 19, 241, 25, 73, 77, 47, 144, 141, 97, 118, 55,
        87, 164, 98, 183, 171, 93, 52, 11, 121, 253, 165, 110, 122, 149, 176, 102,
        212, 124, 26, 244, 7, 192, 170, 150, 88, 178, 194, 166, 96, 191,
    ]));
    // Client
    console.log("My address:", payerPair.publicKey.toString());
    const balance = await solanaConnection.getBalance(payerPair.publicKey);
    console.log(`My balance: ${balance / web3_js_1.LAMPORTS_PER_SOL} SOL`);
    const mint = new web3_js_1.PublicKey("FHCGL4XBLqks5zRkL53P7Piqdw8pdayqC8xcViSf8Pd4");
    const user_token_account = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(solanaConnection, payerPair, mint, payerPair.publicKey);
    const postBalance = (await solanaConnection.getTokenAccountBalance(user_token_account.address)).value.uiAmount;
    console.log(`My token: ${postBalance} NSDL`);
    let user_wsol_token_account = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(solanaConnection, payerPair, spl_token_1.NATIVE_MINT, // mint
    payerPair.publicKey // owner
    );
    console.log(`user_wsol_token_account: ${user_wsol_token_account.address.toBase58()}`);
    const initwsolBalance = (await solanaConnection.getTokenAccountBalance(user_wsol_token_account.address)).value.uiAmount;
    console.log(`My initwsolBalance: ${initwsolBalance} WSOL`);
    let amount = 3 * 1e9;
    // let tx = new Transaction().add(
    //   // trasnfer SOL
    //   SystemProgram.transfer({
    //     fromPubkey: payerPair.publicKey,
    //     toPubkey: user_wsol_token_account.address,
    //     lamports: amount,
    //   }),
    //   // sync wrapped SOL balance
    //   createSyncNativeInstruction(user_wsol_token_account.address, TOKEN_PROGRAM_ID)
    // );
    // console.log(
    //   `txhash: ${await sendAndConfirmTransaction(solanaConnection, tx, [payerPair])}`
    // );
    // const wsolBalance = (
    //   await solanaConnection.getTokenAccountBalance(user_wsol_token_account.address)
    // ).value.uiAmount;
    // console.log(`My token: ${wsolBalance} WSOL`);
    const smart_comtract_address = "EaHoDFV3PCwUEFjU6b5U4Y76dW5oP7Bu1ndga8WgksFU";
    const payerWallet = new anchor_1.Wallet(payerPair);
    const provider = new anchor_1.AnchorProvider(solanaConnection, payerWallet, {
        commitment: 'confirmed',
    });
    const programId = new web3_js_1.PublicKey(smart_comtract_address);
    const data = fs_1.default.readFileSync('./spl.json', 'utf8'); // 读取文件内容，使用 'utf8' 以获取字符串
    const jsonData = JSON.parse(data);
    const program = new anchor_1.Program(jsonData, programId, provider);
    // --------------------------createtoken-------------------------------
    const TOKEN_METADATA_PROGRAM_ID = new web3_js_1.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
    const DIFF_SEED = "MONI_2";
    const metadata = {
        name: DIFF_SEED,
        symbol: DIFF_SEED,
        uri: "https://arweave.net/Xjqaj_rYYQGrsiTk9JRqpguA813w6NGPikcRyA1vAHM",
        decimals: 9,
        id: DIFF_SEED,
    };
    const [metadatamint, bump] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("mint"), Buffer.from(metadata.id)], program.programId);
    console.log("metadatamint address: ", metadatamint.toBase58());
    const [metadataAddress] = web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        metadatamint.toBuffer(),
    ], TOKEN_METADATA_PROGRAM_ID);
    const listenerCreateToken = program.addEventListener("EVENTCreateToken", (event, slot) => {
        console.log(`EVENTCreateToken: name = ${event.name},symbol = ${event.symbol}`);
    });
    const info = await solanaConnection.getAccountInfo(metadatamint);
    if (info) {
        console.log("metadatamint exists");
        return; // Do not attempt to initialize if already initialized
    }
    console.log("  Mint not found. Initializing Program...");
    const context = {
        metadata: metadataAddress,
        mint: metadatamint,
        payer: payerPair.publicKey,
        rent: web3_js_1.SYSVAR_RENT_PUBKEY,
        systemProgram: web3_js_1.SystemProgram.programId,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    };
    const txHash = await program.methods
        .createToken(metadata)
        .accounts(context)
        .signers([])
        .rpc();
    await solanaConnection.confirmTransaction(txHash, "finalized");
    console.log(`  https://explorer.solana.com/tx/${txHash}?cluster=devnet`);
    // This line is only for test purposes to ensure the event
    // listener has time to listen to event.
    // sleep(50000);
    program.removeEventListener(listenerCreateToken);
    // --------------------------minttoken-------------------------------
}
main().then(() => process.exit(), err => {
    console.error(err);
    process.exit(-1);
});
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
