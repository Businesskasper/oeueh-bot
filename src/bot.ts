import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import {
	AnyChannel,
	Client,
	Message,
	TextBasedChannel,
	TextBasedChannelTypes,
	User,
} from "discord.js";
import { inject, injectable } from "inversify";
import { debounceTime } from "rxjs";
import { AppSettings } from "./app-settings";
import { LoggingService } from "./logging.service";
import { MessageBroker } from "./message-broker";
import { SendMessageModel } from "./models/send-message.model";
import { SlashCommand } from "./slash-commands/slash-command";
import { TYPES } from "./types";

@injectable()
export class Bot {
	constructor(
		@inject(TYPES.Client) private client: Client,
		@inject(TYPES.MessageBroker)
		private messageBroker: MessageBroker,
		@inject(TYPES.LoggingService)
		private loggingService: LoggingService,
		@inject(TYPES.AppSettings)
		private appSettings: AppSettings
	) {}

	public setup(): Promise<Bot> {
		this.client.on("messageCreate", (message: Message) => {
			if (message.author.bot) {
				this.loggingService.LogMessage(
					"Ignoring bot message",
					false
				);
				return;
			}
			this.messageBroker.dispatchMessageReceived(message);
		});

		this.client.on("interactionCreate", interaction => {
			interaction.inCachedGuild() &&
				this.messageBroker.dispatchInteractionReceived(
					interaction
				);
		});

		this.messageBroker.onSendMessage$.subscribe(
			(sendMessage: SendMessageModel) =>
				this.sendMessage(
					sendMessage.messageText,
					sendMessage.channelId,
					sendMessage.userId
				)
		);

		this.messageBroker.onCommandsRegistered$
			.pipe(debounceTime(300))
			.subscribe((slashCommands: SlashCommand[]) =>
				this.registerSlashCommands(slashCommands)
			);

		return new Promise((resolve, reject) => {
			this.client
				.login(this.appSettings.Token)
				.then(_ => resolve(this))
				.catch(err => {
					reject(err);
				});
		});
	}

	private registerSlashCommands(
		slashCommands: SlashCommand[]
	): Promise<void> {
		const commandsToRegister = slashCommands.map(
			slashCommand => slashCommand.command.toJSON()
		);
		const rest = new REST({ version: "9" }).setToken(
			this.appSettings.Token
		);
		return new Promise((resolve, reject) => {
			rest
				.put(
					Routes.applicationGuildCommands(
						this.appSettings.ClientId,
						this.appSettings.GuildId
					),
					{ body: commandsToRegister }
				)
				.then(_ => resolve())
				.catch(err => {
					reject(err);
				});
		});
	}

	private sendMessage(
		content: string,
		channelId: string,
		userId: string
	) {
		if (channelId) {
			this.getChannel(channelId).then(
				channel =>
					this.isTextBasedChannel(channel) &&
					channel?.send({ content })
			);
		}
		if (userId) {
			this.getUser(userId)
				.then((user: User) => {
					user.send({ content });
				})
				.catch(err => {
					this.loggingService.LogError(
						`Error on fetching user with id ${userId}: \n ${err}`
					);
				});
		}
	}

	private isTextBasedChannel(
		channel: AnyChannel
	): channel is TextBasedChannel {
		const textChannelTypes: Array<TextBasedChannelTypes> = [
			"DM",
			"GUILD_NEWS",
			"GUILD_STAGE_VOICE",
			"GUILD_TEXT",
			"GUILD_NEWS_THREAD",
			"GUILD_PUBLIC_THREAD",
			"GUILD_PRIVATE_THREAD",
			"GUILD_VOICE",
		];
		return textChannelTypes.includes(
			channel.type as TextBasedChannelTypes
		);
	}

	private getChannel(
		channelId: string
	): Promise<AnyChannel | undefined> {
		const channel =
			this.client.channels.cache.get(channelId);
		if (channel) {
			return Promise.resolve(channel);
		} else {
			return this.client.channels.fetch(channelId);
		}
	}

	private getUser(userId: string): Promise<User> {
		const user = this.client.users.cache.get(userId);
		if (user) {
			return Promise.resolve(user);
		} else {
			return this.client.users.fetch(userId);
		}
	}
}
