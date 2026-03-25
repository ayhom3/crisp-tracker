"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReport = generateReport;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function generateReport(startDate, endDate) {
    const logPath = path_1.default.join('logs', `${startDate}_to_${endDate}.json`);
    if (!fs_1.default.existsSync(logPath)) {
        console.log('No log file found for this date range.');
        return;
    }
    const raw = fs_1.default.readFileSync(logPath, 'utf-8');
    const results = JSON.parse(raw);
    console.log(`\nDaily Report - ${startDate} to ${endDate}`);
    console.log('-----------------------------');
    for (const [phrase, data] of Object.entries(results)) {
        console.log(`\n"${phrase}" mentioned ${data.count} time(s)`);
        for (const mention of data.mentions) {
            console.log(`  ${mention.date} - ${mention.operator}`);
        }
    }
    console.log('\n-----------------------------\n');
}
