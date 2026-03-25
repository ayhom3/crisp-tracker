import fs from 'fs';
import path from 'path';

export async function generateReport(startDate: string, endDate: string): Promise<void> {
  const logPath = path.join('logs', `${startDate}_to_${endDate}.json`);

  if (!fs.existsSync(logPath)) {
    console.log('No log file found for this date range.');
    return;
  }

  const raw = fs.readFileSync(logPath, 'utf-8');
  const results = JSON.parse(raw);

  console.log(`\nDaily Report - ${startDate} to ${endDate}`);
  console.log('-----------------------------');

  for (const [phrase, data] of Object.entries(results) as any) {
    console.log(`\n"${phrase}" mentioned ${data.count} time(s)`);
    for (const mention of data.mentions) {
      console.log(`  ${mention.date} - ${mention.operator}`);
    }
  }

  console.log('\n-----------------------------\n');
}
