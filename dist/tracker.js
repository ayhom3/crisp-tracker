"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackPhrases = trackPhrases;
const crisp_api_1 = __importDefault(require("crisp-api"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client = new crisp_api_1.default();
client.authenticateTier('plugin', process.env.CRISP_API_IDENTIFIER, process.env.CRISP_API_KEY);
const WEBSITE_ID = process.env.CRISP_WEBSITE_ID;
const PHRASES_TO_TRACK = [
    'Chess',
    'control',
    'refund',
    'https://a-alhomsi.com',
];
async function trackPhrases() {
    console.log('Scanning conversations...');
    try {
        const results = {};
        const conversations = await client.website.listConversations(WEBSITE_ID, 1);
        console.log('Conversations fetched:', JSON.stringify(conversations));
        for (const convo of conversations) {
            const messages = await client.website.getMessagesInConversation(WEBSITE_ID, convo.session_id);
            for (const message of messages) {
                if (message.from === 'operator' && typeof message.content === 'string') {
                    for (const phrase of PHRASES_TO_TRACK) {
                        if (message.content.toLowerCase().includes(phrase.toLowerCase())) {
                            results[phrase] = (results[phrase] || 0) + 1;
                        }
                    }
                }
            }
        }
        const date = new Date().toISOString().split('T')[0];
        const logPath = path_1.default.join('logs', `${date}.json`);
        fs_1.default.writeFileSync(logPath, JSON.stringify(results, null, 2));
        console.log('Tracking complete. Results saved to', logPath);
    }
    catch (error) {
        console.error('Error during tracking:', error);
    }
}
