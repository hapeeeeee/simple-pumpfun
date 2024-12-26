import { log } from 'console';
import { HttpsProxyAgent } from 'hpagent';
import fetch from 'node-fetch';
import { config } from 'dotenv';
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
  } from "@solana/web3.js";

config();
const proxy = "http://127.0.0.1:7890";
const proxyAgent = new HttpsProxyAgent ({ proxy });

const solanaConnection = new Connection("https://devnet.helius-rpc.com/?api-key=0e4875a4-435d-4013-952a-1f82e3715f09", {
    commitment: 'confirmed',
    fetch: async (input, options) => {
      const processedInput =
      typeof input === 'string' && input.slice(0, 2) === '//'
        ? 'https:' + input
        : input;    
  
      const result = await fetch(processedInput, {
        ...options,
        agent: proxyAgent,
      });
  
      log('RESPONSE STATUS', result.status);
      return result;
    },
  });


  export default solanaConnection;