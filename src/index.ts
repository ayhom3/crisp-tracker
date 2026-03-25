import dotenv from 'dotenv';
import cron from 'node-cron';
import { trackPhrases } from './tracker';
import { generateReport } from './report';

dotenv.config();

console.log('Crisp Tracker started...');

// Manual test run
trackPhrases().then(() => generateReport());

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily tracker...');
  await trackPhrases();
  await generateReport();
});
