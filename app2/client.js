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
const hpagent_1 = require("hpagent");
const dotenv_1 = require("dotenv");
const utils_1 = require("./utils");
const config_1 = require("./config");
(0, dotenv_1.config)();
const proxy = "http://127.0.0.1:7890";
const proxyAgent = new hpagent_1.HttpsProxyAgent({ proxy });
const solanaConnection = new web3_js_1.Connection("https://devnet.helius-rpc.com/?api-key=0e4875a4-435d-4013-952a-1f82e3715f09", {
    commitment: 'confirmed',
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
        const smart_comtract_address = "99Y76UAMBqcPn3kMPfFmfhQ2DP7mxYFeH1veVqP8nrps";
        const payerWallet = new anchor_1.Wallet(payerPair);
        const provider = new anchor_1.AnchorProvider(solanaConnection, payerWallet, {
            commitment: 'confirmed',
        });
        const programId = new web3_js_1.PublicKey(smart_comtract_address);
        const data = fs_1.default.readFileSync('./spl.json', 'utf8'); // 读取文件内容，使用 'utf8' 以获取字符串
        const jsonData = JSON.parse(data);
        const program = new anchor_1.Program(jsonData, programId, provider);
        // >> ------------------- raydium test4 -------------------
        // test route swap  
        const owner = payerPair;
        console.log("owner: ", owner.publicKey.toString());
        const confirmOptions = {
            skipPreflight: true,
        };
        const { cpSwapPoolState, cpSwapPoolState2 } = yield (0, utils_1.setupSwapTestV2)(program, solanaConnection, owner, { transferFeeBasisPoints: 0, MaxFee: 0 });
        // token2(WSOL) -- token0(USDT)
        // token2(WSOL) -- token1(MEME)
        const inputMemeToken = cpSwapPoolState2.token1Mint; // 卖meme
        const inputMemeTokenProgram = cpSwapPoolState2.token1Program;
        const outputUsdtlToken = cpSwapPoolState.token1Mint; // 得到 USDT
        const outputUsdtTokenProgram = cpSwapPoolState.token1Program;
        yield sleep(1000);
        const baseOutTx = yield (0, utils_1.proxy_sell_in_raydium)(program, owner, config_1.configAddress, inputMemeToken, inputMemeTokenProgram, outputUsdtlToken, outputUsdtTokenProgram, new anchor_1.BN(100000000), new anchor_1.BN(0), confirmOptions);
        console.log("baseOutputTx:", baseOutTx);
        // << ------------------- raydium test3 -------------------
    });
}
main().then(() => process.exit(), err => {
    console.error(err);
    process.exit(-1);
});
