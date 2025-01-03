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
const fs = __importStar(require("fs"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
(() => __awaiter(void 0, void 0, void 0, function* () {
    const connection = new web3_js_1.Connection("https://devnet.helius-rpc.com/?api-key=0e4875a4-435d-4013-952a-1f82e3715f09", {
        commitment: 'confirmed'
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
}))();
