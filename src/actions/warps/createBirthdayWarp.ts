import {
    elizaLogger,
    type ActionExample,
    type Content,
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    ModelClass,
    type State,
    generateObject,
    composeContext,
    type Action,
} from "@elizaos/core";
import { WalletProvider } from "../../providers/wallet";
import { validateMultiversxConfig } from "../../environment";
import { isUserAuthorized } from "../../utils/accessTokenManagement";
import { TransactionWatcher, ApiNetworkProvider } from "@multiversx/sdk-core";
import { MVX_NETWORK_CONFIG } from "../../constants";
import { birthdayWarpSchema } from "../../utils/schemas";
import axios from "axios";

export interface BirthdayWarpContent extends Content {
    walletAddress: string;
}

const birthdayWarpTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "walletAddress": "erd1ezxnz5lywd5zpcnl7x3u74vc60tgjxdnga3s0608gmnx6rsxmwhqudsllw"
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the birthday warp request:
- Wallet address

Respond with a JSON markdown block containing only the extracted values.`;

export default {
    name: "CREATE_BIRTHDAY_WARP",
    similes: ["SEND_BIRTHDAY_EGLD"],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        elizaLogger.log("Validating create birthday warp action for user:", message.userId);
        await validateMultiversxConfig(runtime);
        return true;
    },
    description: "Create a birthday warp transaction.",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        elizaLogger.log("Starting CREATE_BIRTHDAY_WARP handler...");

        if (!isUserAuthorized(message.userId, runtime)) {
            elizaLogger.error(
                "Unauthorized user attempted to create a birthday warp:",
                message.userId
            );
            if (callback) {
                callback({
                    text: "You do not have permission to create a birthday warp.",
                    content: { error: "Unauthorized user" },
                });
            }
            return false;
        }

        let currentState: State;
        if (!state) {
            currentState = (await runtime.composeState(message)) as State;
        } else {
            currentState = await runtime.updateRecentMessageState(state);
        }

        const warpContext = composeContext({
            state: currentState,
            template: birthdayWarpTemplate,
        });

        const content = await generateObject({
            runtime,
            context: warpContext,
            modelClass: ModelClass.SMALL,
            schema: birthdayWarpSchema,
        });

        const payload = content.object as BirthdayWarpContent;

        if (!payload.walletAddress) {
            elizaLogger.error("Invalid content for CREATE_BIRTHDAY_WARP action.");
            if (callback) {
                callback({
                    text: "Unable to process birthday warp request. Invalid content provided.",
                    content: { error: "Invalid warp content" },
                });
            }
            return false;
        }

        try {
            const privateKey = runtime.getSetting("MVX_PRIVATE_KEY");
            const network = runtime.getSetting("MVX_NETWORK");
            const networkConfig = MVX_NETWORK_CONFIG[network];
            

            const walletProvider = new WalletProvider(privateKey, network);

            const apiNetworkProvider = new ApiNetworkProvider(
                networkConfig.apiURL,
                {
                    clientName: "ElizaOs",
                }
            );

            const transactionData = {
                receiverAddress: walletProvider.getAddress().toBech32(),
                amount: "0", 
                data: JSON.stringify({
                    protocol: "warp:0.1.0",
                    name: "Birthday gift",
                    title: "Send birthday EGLD",
                    description: "Send me EGLD for my birthday",
                    preview: "",
                    actions: [
                        {
                            type: "contract",
                            label: "Send EGLD",
                            address: payload.walletAddress,
                            func: "transfer",
                            args: [],
                            gasLimit: 10000000,
                            inputs: [
                                {
                                    name: "value",
                                    description: "Amount of eGold to send.",
                                    type: "biguint",
                                    position: "value",
                                    source: "field",
                                    required: true,
                                    min: 1,
                                    modifier: "scale:18",
                                },
                            ],
                        },
                    ],
                }),
                gasLimit: 10000000,
            };

            const txHash = await walletProvider.sendEGLD(transactionData);

            const watcher = new TransactionWatcher(apiNetworkProvider);
            const transactionOnNetwork = await watcher.awaitCompleted(txHash);
            const warpUrl = `https://devnet.usewarp.to/hash%3A${txHash}`
            
            if (
                "status" in transactionOnNetwork.status &&
                transactionOnNetwork.status.status === "success"
            ) {
                const response = await axios.post(`https://qrcode-api.elpulpo.xyz/generate_qr?data=${warpUrl}`);

            elizaLogger.info(`API response received: ${JSON.stringify(response.data)}`);

            if (response.data && response.data.preview_url) {
                const qrCodeImageUrl = `https://qrcode-api.elpulpo.xyz${response.data.preview_url}`;

                elizaLogger.info(`QR code generated successfully: ${qrCodeImageUrl}`);

                callback?.({
                    text: `Here is the QR code that you can share: ${qrCodeImageUrl}`,
                });
                return true;
            } else {
                elizaLogger.error("Failed to generate QR code, no image URL returned");
                throw new Error('Failed to generate QR code');
            }
            }
        } catch (error) {
            elizaLogger.error("Error during birthday warp transaction:", error);
            if (callback) {
                callback({
                    text: `Error creating birthday warp transaction: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Create a birthday warp for wallet erd1examplewallet",
                    action: "CREATE_BIRTHDAY_WARP",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Successfully created birthday warp transaction.",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;
