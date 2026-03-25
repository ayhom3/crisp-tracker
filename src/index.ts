import dotenv from 'dotenv';
import { trackPhrases } from './tracker';
import { generateReport } from './report';

dotenv.config();

console.log('Crisp Tracker started...');

const START_DATE = process.argv[2] || new Date().toISOString().split('T')[0];
const END_DATE = process.argv[3] || new Date().toISOString().split('T')[0];

trackPhrases(START_DATE, END_DATE).then(() => generateReport(START_DATE, END_DATE));
