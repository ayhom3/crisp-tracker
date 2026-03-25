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

const START_DATE = process.argv[2] || new Date().toISOString().split('T')[0];
const END_DATE = process.argv[3] || new Date().toISOString().split('T')[0];

export async function trackPhrases(): Promise<void> {
  console.log('trackPhrases called...');
  console.log(`Scanning from ${START_DATE} to ${END_DATE}`);

  try {
    const results: Record<string, { count: number; mentions: { date: string; operator: string }[] }> = {};
    const startTimestamp = new Date(START_DATE).getTime();
    const endTimestamp = new Date(END_DATE + 'T23:59:59').getTime();

    let page = 1;
    let allConversations: any[] = [];

    console.log('Fetching all conversations...');

    while (true) {
      const conversations = await client.website.listConversations(WEBSITE_ID, page);

      if (!conversations || conversations.length === 0) break;

	const rangeConvos = conversations.filter(
	  (c: any) => c.updated_at >= startTimestamp && c.updated_at <= endTimestamp
	);

      allConversations = [...allConversations, ...rangeConvos];

      if (rangeConvos.length === 0) break;

      console.log(`Fetched page ${page}, ${rangeConvos.length} conversations in range`);
      page++;
    }

    console.log(`Total conversations to scan: ${allConversations.length}`);

    for (const convo of allConversations) {
      const messages = await client.website.getMessagesInConversation(
        WEBSITE_ID,
        convo.session_id
      );

      for (const message of messages) {
        const messageDate = new Date(message.timestamp ?? Date.now()).toISOString().split('T')[0];

        if (
          message.from === 'operator' &&
          typeof message.content === 'string' &&
          messageDate >= START_DATE &&
          messageDate <= END_DATE
        ) {
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

    const logPath = path.join('logs', `${START_DATE}_to_${END_DATE}.json`);
    fs.writeFileSync(logPath, JSON.stringify(results, null, 2));
    console.log('Tracking complete. Results saved to', logPath);

  } catch (error) {
    console.error('Error during tracking:', error);
  }
}
