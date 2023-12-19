import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";

export type SupportNetwork = "sei" | "inj" | "cosmos" | "celestia";
export interface InitializeNetworkPayload {
    Rpc:         string;
    Name:        SupportNetwork;
    SelfWallet:  DirectSecp256k1Wallet;
}

export class ComsmosSDKBuildRpcConnector {
    private client: SigningStargateClient | undefined;
    private initializePromise: Promise<void>;

    constructor(payload: InitializeNetworkPayload) {
        this.initializePromise = this.initialize(payload);
    }

    private async initialize(initialize: InitializeNetworkPayload) {
        this.client = await SigningStargateClient.connectWithSigner(
            initialize.Rpc,
            initialize.SelfWallet
        );
    }

    public async getCurrentClient(): Promise<SigningStargateClient> {
        await this.initializePromise;
        if (!this.client) throw new Error("CosmosSDKRpcConnector not properly initialized");
        return this.client as SigningStargateClient;
    }
}
