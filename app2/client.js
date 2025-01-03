"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
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
        const smart_comtract_address = "3jAsb7VWNdrYDZLqeFSwmqS4dSRBXm3oKffBmaP8L4sh";
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
    const keypairPath = `/data/zhangxiao/solana/pumpfun/ppl/app/keys/user1.json`;
    const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
    const fromKeypair = web3_js_1.Keypair.fromSecretKey(new Uint8Array(keypairData));
    console.log("fromKeypair: ", fromKeypair.publicKey.toBase58());
    const to_wallet = web3_js_1.Keypair.fromSecretKey(new Uint8Array([
        32, 170, 209, 222, 174, 15, 95, 191, 172, 227, 88, 30, 88, 72, 98, 206, 41,
        50, 136, 153, 216, 242, 228, 19, 241, 25, 73, 77, 47, 144, 141, 97, 118, 55,
        87, 164, 98, 183, 171, 93, 52, 11, 121, 253, 165, 110, 122, 149, 176, 102,
        212, 124, 26, 244, 7, 192, 170, 150, 88, 178, 194, 166, 96, 191,
    ]));
    const toAddr = to_wallet.publicKey;
    let token0 = yield (0, spl_token_1.createMint)(connection, fromKeypair, utils_1.tmpPayerPair.publicKey, utils_1.tmpPayerPair.publicKey, 9, web3_js_1.Keypair.generate(), null, spl_token_1.TOKEN_2022_PROGRAM_ID);
    console.log("token0mint:", token0.toBase58());
    const ownerToken0Account = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, fromKeypair, token0, fromKeypair.publicKey, false, "processed", { skipPreflight: true }, spl_token_1.TOKEN_2022_PROGRAM_ID);
    console.log("ownerToken0Account:", ownerToken0Account.address.toBase58());
    yield (0, spl_token_1.mintTo)(connection, fromKeypair, token0, ownerToken0Account.address, utils_1.tmpPayerPair, 100000000000000, [], { skipPreflight: true }, spl_token_1.TOKEN_2022_PROGRAM_ID);
    let token_account1_balance = yield connection.getTokenAccountBalance(ownerToken0Account.address);
    console.log("from account has ", token_account1_balance, " token");
    console.info(token0);
    // tokenArray.push({ address: token0, program: TOKEN_2022_PROGRAM_ID });
    // const usdcMint = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");
    const lamportsToSend = 1000000;
    // Amount to send (1 USDC in this case, as USDC has 6 decimals)
    // const fromTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromKeypair, tmpPayerPair.publicKey, fromKeypair.publicKey);
    // const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromKeypair, tmpPayerPair.publicKey, toAddr);
    const fromTokenAccount = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, fromKeypair, token0, fromKeypair.publicKey, false, "processed", { skipPreflight: true }, spl_token_1.TOKEN_2022_PROGRAM_ID);
    const toTokenAccount = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, fromKeypair, token0, toAddr, false, "processed", { skipPreflight: true }, spl_token_1.TOKEN_2022_PROGRAM_ID);
    const transfer = (0, spl_token_1.createTransferInstruction)(ownerToken0Account.address, toTokenAccount.address, fromKeypair.publicKey, lamportsToSend, [], spl_token_1.TOKEN_2022_PROGRAM_ID);
    const transferTransaction = new web3_js_1.Transaction().add(transfer);
    const txhash = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transferTransaction, [fromKeypair,]);
    console.info(txhash);
};
