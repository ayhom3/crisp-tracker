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
    'Apple',
    'Orange',
    'https://discord.com/',
];
async function trackPhrases(startDate, endDate) {
    console.log('trackPhrases called...');
    console.log(`Scanning from ${startDate} to ${endDate}`);
    try {
        const results = {};
        const startTimestamp = new Date(startDate).getTime();
        const endTimestamp = new Date(endDate + 'T23:59:59').getTime();
        let page = 1;
        let allConversations = [];
        console.log('Fetching all conversations...');
        while (true) {
            const conversations = await client.website.listConversations(WEBSITE_ID, page);
            if (!conversations || conversations.length === 0)
                break;
            const rangeConvos = conversations.filter((c) => c.updated_at >= startTimestamp && c.updated_at <= endTimestamp);
            allConversations = [...allConversations, ...rangeConvos];
            if (rangeConvos.length === 0)
                break;
            console.log(`Fetched page ${page}, ${rangeConvos.length} conversations in range`);
            page++;
        }
        console.log(`Total conversations to scan: ${allConversations.length}`);
        for (const convo of allConversations) {
            const messages = await client.website.getMessagesInConversation(WEBSITE_ID, convo.session_id);
            for (const message of messages) {
                const messageDate = new Date(message.timestamp ?? Date.now()).toISOString().split('T')[0];
                if (message.from === 'operator' &&
                    typeof message.content === 'string' &&
                    messageDate >= startDate &&
                    messageDate <= endDate) {
                    for (const phrase of PHRASES_TO_TRACK) {
                        if (message.content.toLowerCase().includes(phrase.toLowerCase())) {
                            if (!results[phrase]) {
                                results[phrase] = { count: 0, mentions: [] };
                            }
                            results[phrase].count += 1;
                            const date = new Date(message.timestamp ?? Date.now());
                            const formatted = date.toLocaleDateString('en-GB') + ', ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                            results[phrase].mentions.push({
                                date: formatted,
                                operator: message.user?.nickname || message.user?.user_id || 'Unknown'
                            });
                        }
                    }
                }
            }
        }
        const logPath = path_1.default.join('logs', `${startDate}_to_${endDate}.json`);
        fs_1.default.writeFileSync(logPath, JSON.stringify(results, null, 2));
        console.log('Tracking complete. Results saved to', logPath);
    }
    catch (error) {
        console.error('Error during tracking:', error);
    }
}
