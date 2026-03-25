import fs from 'fs';
import path from 'path';

export async function generateReport(): Promise<void> {
  const date = new Date().toISOString().split('T')[0];
  const logPath = path.join('logs', `${date}.json`);

  if (!fs.existsSync(logPath)) {
    console.log('No log file found for today.');
    return;
  }

  const raw = fs.readFileSync(logPath, 'utf-8');
  const results: Record<string, number> = JSON.parse(raw);

  console.log('\nDaily Report -', date);
  console.log('-----------------------------');

  for (const [phrase, count] of Object.entries(results)) {
    console.log(`"${phrase}" -> sent ${count} time(s)`);
  }

  console.log('-----------------------------\n');
}
