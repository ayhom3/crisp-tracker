"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const node_cron_1 = __importDefault(require("node-cron"));
const tracker_1 = require("./tracker");
const report_1 = require("./report");
dotenv_1.default.config();
console.log('Crisp Tracker started...');
// Manual test run
(0, tracker_1.trackPhrases)().then(() => (0, report_1.generateReport)());
// Run every day at midnight
node_cron_1.default.schedule('0 0 * * *', async () => {
    console.log('Running daily tracker...');
    await (0, tracker_1.trackPhrases)();
    await (0, report_1.generateReport)();
});
