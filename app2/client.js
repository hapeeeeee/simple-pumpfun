"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const utils_1 = require("./utils");
const config_1 = require("./config");
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
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const payerPair = web3_js_1.Keypair.fromSecretKey(new Uint8Array([
            194, 190, 60, 63, 95, 22, 140, 179, 70, 243, 28, 220, 186, 76,
            109, 68, 88, 173, 179, 40, 183, 12, 8, 181, 50, 171, 217, 169,
            72, 73, 55, 183, 174, 19, 209, 164, 211, 94, 134, 5, 107, 145,
            212, 183, 75, 35, 6, 121, 52, 174, 232, 11, 243, 177, 167, 69,
            176, 10, 81, 7, 223, 168, 78, 58
        ]));
        // Client
        console.log("My address:", payerPair.publicKey.toString());
        const balance = yield solanaConnection.getBalance(payerPair.publicKey);
        console.log(`My balance: ${balance / web3_js_1.LAMPORTS_PER_SOL} SOL`);
        // var transaction = new Transaction().add(
        //   SystemProgram.transfer({
        //     fromPubkey: payerPair.publicKey,
        //     toPubkey: new PublicKey("DcEdwvQ8UGjRArQR31saWn4US8kZP9KzXVuCSUSDJ5kD"),
        //     lamports: 4*LAMPORTS_PER_SOL,
        //   })
        // );
        // // Sign transaction, broadcast, and confirm
        // var signature = await sendAndConfirmTransaction(
        //   solanaConnection,
        //   transaction,
        //   [payerPair]
        // );
        const mint = new web3_js_1.PublicKey("FHCGL4XBLqks5zRkL53P7Piqdw8pdayqC8xcViSf8Pd4");
        const user_token_account = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(solanaConnection, payerPair, mint, payerPair.publicKey);
        const postBalance = (yield solanaConnection.getTokenAccountBalance(user_token_account.address)).value.uiAmount;
        console.log(`My token: ${postBalance} NSDL`);
        let user_wsol_token_account = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(solanaConnection, payerPair, spl_token_1.NATIVE_MINT, // mint
        payerPair.publicKey // owner
        );
        console.log(`user_wsol_token_account: ${user_wsol_token_account.address.toBase58()}`);
        const initwsolBalance = (yield solanaConnection.getTokenAccountBalance(user_wsol_token_account.address)).value.uiAmount;
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
        const smart_comtract_address = "99Y76UAMBqcPn3kMPfFmfhQ2DP7mxYFeH1veVqP8nrps";
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
        // // >> ------------------- raydium test1 -------------------
        // // describe("initialize test", () => {
        // const owner = payerPair;
        // console.log("owner: ", owner.publicKey.toString());
        // const confirmOptions = {
        //   skipPreflight: true,
        // };
        // const { configAddress, token0, token0Program, token1, token1Program } =
        //     await setupInitializeTest(
        //       solanaConnection,
        //       owner,
        //       { transferFeeBasisPoints: 0, MaxFee: 0 },
        //       confirmOptions
        //     );
        //   console.log("setupInitializeTest success");
        //   const initAmount0 = new BN(100);
        //   const initAmount1 = new BN(1000);
        //   console.log("before initialize");
        //   const { poolAddress, cpSwapPoolState } = await initialize(
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
        //   console.log("pool address: ", poolAddress.toString());
        // // });
        // // << ------------------- raydium test1 -------------------
        // >> ------------------- raydium test2 -------------------
        // describe("deposit test", () => {
        // const owner = payerPair;
        // console.log("owner: ", owner.publicKey.toString());
        // const confirmOptions = {
        //   skipPreflight: true,
        // };
        // const cpSwapPoolState = await setupDepositTest(
        //   program,
        //   solanaConnection,
        //   owner,
        //   { transferFeeBasisPoints: 0, MaxFee: 0 }
        // );
        // const liquidity = new BN(10000000000);
        // await deposit(
        //   program,
        //   owner,
        //   cpSwapPoolState.ammConfig,
        //   cpSwapPoolState.token0Mint,
        //   cpSwapPoolState.token0Program,
        //   cpSwapPoolState.token1Mint,
        //   cpSwapPoolState.token1Program,
        //   liquidity,
        //   new BN(10000000000),
        //   new BN(20000000000),
        //   confirmOptions
        // );
        // console.log("depositTx success");
        // });
        // << ------------------- raydium test2 -------------------
        // >> ------------------- raydium test3 -------------------
        // describe("swap test", () => {
        const owner = payerPair;
        console.log("owner: ", owner.publicKey.toString());
        const confirmOptions = {
            skipPreflight: true,
        };
        // it("swap base input", async () => {
        // const cpSwapPoolState = await setupSwapTest(
        //   program,
        //   solanaConnection,
        //   owner,
        //   { transferFeeBasisPoints: 0, MaxFee: 0 }
        // );
        // const inputToken = cpSwapPoolState.token0Mint;
        // const inputTokenProgram = cpSwapPoolState.token0Program;
        // await sleep(1000);
        // let amount_in = new BN(100000000);
        // const baseInTx = await swap_base_input(
        //   program,
        //   owner,
        //   configAddress,
        //   inputToken,
        //   inputTokenProgram,
        //   cpSwapPoolState.token1Mint,
        //   cpSwapPoolState.token1Program,
        //   amount_in,
        //   new BN(0)
        // );
        // console.log("baseInputTx:", baseInTx);
        // });
        // it("proxy_buy_in_raydium", async () => {
        const cpSwapPoolState = yield (0, utils_1.setupSwapTest)(program, solanaConnection, owner, { transferFeeBasisPoints: 0, MaxFee: 0 });
        const inputToken = cpSwapPoolState.token0Mint;
        const inputTokenProgram = cpSwapPoolState.token0Program;
        yield sleep(1000);
        const baseOutTx = yield (0, utils_1.proxy_buy_in_raydium)(program, owner, // 客户的平台方
        config_1.configAddress, inputToken, inputTokenProgram, cpSwapPoolState.token1Mint, cpSwapPoolState.token1Program, new anchor_1.BN(100000000), new anchor_1.BN(0), confirmOptions);
        console.log("baseOutputTx:", baseOutTx);
        // });
        // });
        // << ------------------- raydium test3 -------------------
    });
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
