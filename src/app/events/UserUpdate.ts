import { PartialUser, User } from 'discord.js';
import { DiscordEvent } from '../types/discord/DiscordEvent';
import ServiceUtils from '../utils/ServiceUtils';
import { LogUtils } from '../utils/Log';
import UsernameSpamFilter from '../service/spam-filter/UsernameSpamFilter';

export default class implements DiscordEvent {
	name = 'userUpdate';
	once = false;

	async execute(oldUser: User | PartialUser, newUser: User | PartialUser): Promise<any> {
		try {
			if (oldUser.partial) {
				oldUser = await oldUser.fetch();
			}
			if (newUser.partial) {
				newUser = await newUser.fetch();
			}
		
			if (oldUser.username !== newUser.username) {
				const guildMember = await ServiceUtils.getGuildMemberFromUser(newUser as User, process.env.DISCORD_SERVER_ID);
				
				if (ServiceUtils.isBanklessDAO(guildMember.guild)) {
					if (await UsernameSpamFilter.runUsernameSpamFilter(guildMember)) {
						return;
					}
				}
			}
		} catch (e) {
			LogUtils.logError('failed to process event userUpdate', e);
		}
	}
}