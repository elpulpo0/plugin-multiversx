import {
    elizaLogger,
    type Action,
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    type State,
} from "@elizaos/core";
import { WalletProvider } from "../providers/wallet";
import { validateMultiversxConfig } from "../environment";

export default {
    name: "GET_ADDRESS",
    similes: ["CHECK_ADDRESS"],
    description: "Return the agent's wallet address",
    
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        elizaLogger.log("Validating get address action for user:", message.userId);
        await validateMultiversxConfig(runtime);
        return true;
    },

    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback,
    ) => {
        elizaLogger.log("Starting GET_ADDRESS handler...");

        try {
            const privateKey = runtime.getSetting("MVX_PRIVATE_KEY");
            const network = runtime.getSetting("MVX_NETWORK");

            const walletProvider = new WalletProvider(privateKey, network);

            const address = walletProvider.getAddress().toBech32();

        callback?.({
            text: `My wallet address is ${address}`
        });

            return true;
        } catch (error) {
            elizaLogger.error("Error checking address:", error);
            callback?.({
                text: `Could not retrieve wallet address. Error: ${error.message}`});
        }
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "What's your address'?",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "One second, I'll give it to you",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Give me your wallet address please",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Ok, let me get that for you",
                },
            },
        ],
    ],
} as Action;
