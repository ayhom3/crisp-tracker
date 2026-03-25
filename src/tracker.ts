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
  'Apple',
  'Orange',
  'https://discord.com/',
];

export async function trackPhrases(): Promise<void> {
  console.log('trackPhrases called...');

  try {
    const results: Record<string, { count: number; mentions: { date: string; operator: string }[] }> = {};
    const today = new Date().toISOString().split('T')[0];
    const startOfDay = new Date(today).getTime();

    let page = 1;
    let allConversations: any[] = [];

    console.log('Fetching all conversations...');

    while (true) {
      const conversations = await client.website.listConversations(WEBSITE_ID, page);

      if (!conversations || conversations.length === 0) break;

      const todayConvos = conversations.filter(
        (c: any) => c.updated_at >= startOfDay
      );

      allConversations = [...allConversations, ...todayConvos];

      if (todayConvos.length === 0) break;

      console.log(`Fetched page ${page}, ${todayConvos.length} conversations from today`);
      page++;
    }

    console.log(`Total conversations to scan: ${allConversations.length}`);

    for (const convo of allConversations) {
      const messages = await client.website.getMessagesInConversation(
        WEBSITE_ID,
        convo.session_id
      );

      for (const message of messages) {
        if (message.from === 'operator' && typeof message.content === 'string') {
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

    const logPath = path.join('logs', `${today}.json`);
    fs.writeFileSync(logPath, JSON.stringify(results, null, 2));
    console.log('Tracking complete. Results saved to', logPath);

  } catch (error) {
    console.error('Error during tracking:', error);
  }
}
