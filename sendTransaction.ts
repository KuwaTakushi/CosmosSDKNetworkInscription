import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { calculateFee, coins } from "@cosmjs/stargate";
import * as dotenv from "dotenv";
import { ComsmosSDKBuildRpcConnector, InitializeNetworkPayload, SupportNetwork } from "./universalNetwork";
import { msgFromBase64 } from "./constant";

dotenv.config();

export interface WalletData  {
    walletAddress:  string;
    balance:    string;
}

export const sendTransaction = async () => {
  const process = readConfig();

  const selfWallet = await DirectSecp256k1Wallet.fromKey(
    Buffer.from(
      process.privateConfig.walletWithPrivate as any, 
      "hex"), 
      process.publicConfig.networkName,
  );
  console.log(process.publicConfig.networkName);
  const [ account ] = await selfWallet.getAccounts();
  const selfAccount = process.privateConfig.walletWithAccount ? process.privateConfig.walletWithAccount : account.address;

  const initialze: InitializeNetworkPayload = {
    Rpc: process.publicConfig.networkRpc as string,
    Name: getSupportNetworkFromEnv(process.publicConfig.networkName as string),
    SelfWallet: selfWallet,
  }
  const networkClient = new ComsmosSDKBuildRpcConnector(initialze);
  const clientInstance = await networkClient.getCurrentClient();
  const sendAmount = coins(process.brc20ProtocolConfig.brc20SendAmount as string, process.publicConfig.networkDenom as string);
  const fee = {
    amount: coins(
      process.publicConfig.networkGasPrice as string, 
      process.publicConfig.networkDenom as string
    ),
    gas: process.publicConfig.networkGasLimit as string,
  }

  const memo = process.publicConfig.networkMemoOrTag 
    ? process.publicConfig.networkMemoOrTag as string
    : msgFromBase64(
      process.brc20ProtocolConfig.brc20MsgP as string,
      process.brc20ProtocolConfig.brc20MsgOp as string,
      process.brc20ProtocolConfig.brc20MsgTick as string,
      process.brc20ProtocolConfig.brc20MsgAmt as string,
    );

  console.log(selfAccount, sendAmount, memo, fee)
  try {
    const resp = await clientInstance.sendTokens(
      selfAccount,
      selfAccount,
      sendAmount,
      fee,
      memo
    );
    console.log(resp.transactionHash);
  } catch (err) {
    // Sleep 1 second
    console.log("Error", err);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

const mulitSendTransactions = async () => {}


const readConfig = () => {
  const cosmosSdkBuildNetworkName = process.env.COSMOS_SDK_BUILD_NETWORK_NAME;
  const cosmosSdkBuildNetworkRpc = process.env.COSMOS_SDK_BUILD_NETWORK_RPC;
  const cosmosSdkBuildNetworkTicket = process.env.COSMOS_SDK_BUILD_NETWORK_TICKET;

  const cosmosSdkBuildNetworkGasFee = process.env.COSMOS_SDK_BUILD_NETWORK_GAS_FEE;
  const cosmosSdkBuildNetworkGasPrice = process.env.COSMOS_SDK_BUILD_NETWORK_GAS_PRICE;
  const cosmosSdkBuildNetworkGasLimit = process.env.COSMOS_SDK_BUILD_NETWORK_GAS_LIMIT;

  const cosmosSdkBuildNetworkMemoOrTag = process.env.COSMOS_SDK_BUILD_NETWORK_MEMO_OR_TAG;
  const cosmosSdkBuildNetworkDenom = process.env.COSMOS_SDK_BUILD_NETWORK_DENOM;

  const brc20MsgP = process.env.BRC20_MSG_P;
  const brc20MsgOp = process.env.BRC20_MSG_OP;
  const brc20MsgTick = process.env.BRC20_MSG_TICK;
  const brc20MsgAmt = process.env.BRC20_MSG_AMT;
  const brc20SendAmount = process.env.BRC20_SEND_AMOUNT;

  const walletWithPrivate = process.env.WALLET_WITH_PRIVATE;
  const walletWithAccount = process.env.WALLET_WITH_ACCOUNT;

  const config = {
    publicConfig: {
      networkName: cosmosSdkBuildNetworkName,
      networkRpc: cosmosSdkBuildNetworkRpc,
      networkTicket: cosmosSdkBuildNetworkTicket,
      networkGasFee: cosmosSdkBuildNetworkGasFee,
      networkGasPrice: cosmosSdkBuildNetworkGasPrice,
      networkGasLimit: cosmosSdkBuildNetworkGasLimit,
      networkDenom: cosmosSdkBuildNetworkDenom,
      networkMemoOrTag: cosmosSdkBuildNetworkMemoOrTag,
    },
    brc20ProtocolConfig: {
      brc20MsgP: brc20MsgP,
      brc20MsgOp: brc20MsgOp,
      brc20MsgTick: brc20MsgTick,
      brc20MsgAmt: brc20MsgAmt,
      brc20SendAmount: brc20SendAmount,
    },
    privateConfig: {
      walletWithPrivate: walletWithPrivate,
      walletWithAccount: walletWithAccount,
    },
  };

  return config;
};

function getSupportNetworkFromEnv(envValue: string): SupportNetwork {
  switch (envValue) {
    case "sei":
      return "sei";
    case "inj":
      return "inj";
    case "cosmos":
      return "cosmos";
    case "celestia":
      return "celestia";
    default:
      throw new Error("Unsupported network type from environment variable");
  }
}

sendTransaction();
