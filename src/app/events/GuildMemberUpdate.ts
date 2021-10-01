import { Collection, GuildMember, PartialGuildMember, Role, Snowflake } from 'discord.js';
import roleIds from '../service/constants/roleIds';
import AddGuestPass from '../service/guest-pass/AddGuestPass';
import RemoveGuestPass from '../service/guest-pass/RemoveGuestPass';
import { DiscordEvent } from '../types/discord/DiscordEvent';
import ServiceUtils from '../utils/ServiceUtils';
import sendGuildWelcomeMessage from './welcomeMats/GuildMats';

export default class implements DiscordEvent {
	name = 'guildMemberUpdate';
	once = false;

	async execute(oldMember: GuildMember | PartialGuildMember, newMember: GuildMember | PartialGuildMember): Promise<any> {
		try {
			if (oldMember.partial) {
				oldMember = await oldMember.fetch();
			}
			if (newMember.partial) {
				newMember = await newMember.fetch();
			}
		} catch (e) {
			console.error('Retrieving member partial failed');
			return;
		}

		// Only enabled for BanklessDAO server
		if (guildMember.guild.id !== process.env.DISCORD_SERVER_ID) {
			return false;
		}
		if (oldMember.nickname !== newMember.nickname && await ServiceUtils.runUsernameSpamFilter(newMember as GuildMember)) {
			return;
		}
		
		const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
		if (removedRoles.size > 0) {
			console.debug(`The roles ${removedRoles.map(r => r.name)} were removed from ${oldMember.displayName}.`);
			this.handleRolesRemoved(newMember as GuildMember, removedRoles);
			return;
		}

		const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
		if (addedRoles.size > 0) {
			console.debug(`The roles ${addedRoles.map(r => r.name)} were added to ${oldMember.displayName}.`);
			this.handleRolesAdded(newMember as GuildMember, addedRoles);
		}
	}

	/**
	 * Handler for when roles are added to a member.
	 * 
	 * @param guildMember member that roles were added to
	 * @param roles roles that were added to member
	 */
	handleRolesAdded = (guildMember: GuildMember, roles: Collection<Snowflake, Role>): void => {
		roles.each(role => {
			switch (role.id) {
			case roleIds.guestPass:
				AddGuestPass(guildMember).catch(err => console.error(err));
				break;
			case roleIds.developersGuild:
				sendGuildWelcomeMessage.devGuildMat(guildMember).catch(err => console.error(err));
				break;
			}
		});
	}

	/**
	 * Handler for when roles are removed from a member.
	 * 
	 * @param guildMember member that roles were removed from
	 * @param roles roles that were removed from member
	 */
	handleRolesRemoved = (guildMember: GuildMember, roles: Collection<Snowflake, Role>): void => {
		roles.each(role => {
			switch (role.id) {
			case roleIds.guestPass:
				RemoveGuestPass(guildMember).catch(err => console.error(err));
				break;
			}
		});
	}
}
