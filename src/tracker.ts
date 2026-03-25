import Crisp from 'crisp-api';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const client = new Crisp();

client.authenticateTier(
  'plugin',
  process.env.CRISP_API_IDENTIFIER!,
  process.env.CRISP_API_KEY!
);

const WEBSITE_ID = process.env.CRISP_WEBSITE_ID!;

const PHRASES_TO_TRACK = [
  'Chess',
  'control',
  'refund',
  'https://a-alhomsi.com',
];

export async function trackPhrases(): Promise<void> {
  console.log('Scanning conversations...');

  try {
    const results: Record<string, number> = {};

    const conversations = await client.website.listConversations(WEBSITE_ID, 1);
console.log('Conversations fetched:', JSON.stringify(conversations));

	for (const convo of conversations) {
      const messages = await client.website.getMessagesInConversation(
        WEBSITE_ID,
        convo.session_id
      );

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
    const logPath = path.join('logs', `${date}.json`);
    fs.writeFileSync(logPath, JSON.stringify(results, null, 2));
    console.log('Tracking complete. Results saved to', logPath);

  } catch (error) {
    console.error('Error during tracking:', error);
  }
}
