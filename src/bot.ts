import { Channel, Client, CommandInteraction, Message, TextChannel, User } from 'discord.js';
import { inject, injectable } from 'inversify';
import { TYPES } from './types';
import { MessageBroker } from './message-broker';
import { SendMessageModel } from './models/send-message.model';
import { LoggingService } from './logging.service';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { debounceTime } from 'rxjs';
import { SlashCommand } from './slash-commands/slash-command';

@injectable()
export class Bot {

  constructor(
    @inject(TYPES.Client) private client: Client,
    @inject(TYPES.Token) private token: string,
    @inject(TYPES.MessageBroker) private messageBroker: MessageBroker,
    @inject(TYPES.LoggingService) private loggingService: LoggingService,
    @inject(TYPES.ClientId) private clientId: string,
    @inject(TYPES.GuildId) private guildId: string
  ) { }

  public setup(): Promise<Bot> {
    this.client.on('messageCreate', (message: Message) => {
      if (message.author.bot) {
        this.loggingService.LogMessage('Ignoring bot message', false);
        return;
      }
      this.messageBroker.dispatchMessageReceived(message);
    });

    this.client.on('interactionCreate', (interaction: CommandInteraction) => {
      this.messageBroker.dispatchMessageReceived(interaction)
    })

    this.messageBroker.onSendMessage$
      .subscribe((sendMessage: SendMessageModel) => this.sendMessage(sendMessage.messageText, sendMessage.channelId, sendMessage.userId));

    this.messageBroker.onCommandsRegistered$
      .pipe(debounceTime(300))
      .subscribe((slashCommands: SlashCommand[]) => this.registerSlashCommands(slashCommands))

    return new Promise((resolve, reject) => {      
      this.client.login(this.token)
        .then(_ => resolve(this))
        .catch(err => {
          reject(err)
        });
    })
  }

  private registerSlashCommands(slashCommands: SlashCommand[]): Promise<void> {
    let commandsToRegister = slashCommands.map(slashCommand => slashCommand.command.toJSON());
    const rest = new REST({ version: '9' }).setToken(this.token);
    return new Promise((resolve, reject) => {
      rest.put(Routes.applicationGuildCommands(this.clientId, this.guildId), { body: commandsToRegister })
      .then(_ => resolve())
      .catch(err => {
        reject(err)
      })
    })
  }

  private sendMessage(content: string, channelId: string, userId: string) {
    if (channelId) {
      this.getChannel(channelId)
        .then((channel: TextChannel) => channel.send({content}))
    }
    if (userId) {
      this.getUser(userId)
        .then((user: User) => {
          user.send({content})
        })
        .catch(err => {
          this.loggingService.LogError(`Error on fetching user with id ${userId}: \n ${err}`)
        })
    }
  }

  private getChannel(channelId: string): Promise<Channel> {
    let channel = this.client.channels.cache.get(channelId);
    if (channel) {
      return Promise.resolve(channel);
    }
    else {
      return this.client.channels.fetch(channelId);
    }
  }

  private getUser(userId: string): Promise<User> {
    let user = this.client.users.cache.get(userId);
    if (user) {
      return Promise.resolve(user);
    }
    else {
      return this.client.users.fetch(userId);
    }
  }
}
