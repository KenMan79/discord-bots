import messageCreateOnBountyBoard from './bounty/MessageCreateOnBountyBoard';
import { Message } from 'discord.js';
import { DiscordEvent } from '../types/discord/DiscordEvent';
import MessageCreateOnDEGEN from './chat/MessageCreateOnDEGEN';

export default class implements DiscordEvent {
	name = 'messageCreate';
	once = false;

	execute(message: Message): Promise<any> {
		if(message.author.bot && message.webhookId === null) return;
		
		// DEGEN says hello
		MessageCreateOnDEGEN(message).catch(e => {
			console.error('ERROR: ', e);
		});
		// Run for webhook
		messageCreateOnBountyBoard(message).catch(e => {
			console.error('ERROR: ', e);
		});
	}
}