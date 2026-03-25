import dotenv from 'dotenv';
import cron from 'node-cron';
import { trackPhrases } from './tracker';
import { generateReport } from './report';

dotenv.config();

console.log('Crisp Tracker started...');

const START_DATE = process.argv[2] || new Date().toISOString().split('T')[0];
const END_DATE = process.argv[3] || new Date().toISOString().split('T')[0];

// Manual test run
trackPhrases().then(() => generateReport(START_DATE, END_DATE));

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  const today = new Date().toISOString().split('T')[0];
  console.log('Running daily tracker...');
  await trackPhrases();
  await generateReport(today, today);
});
