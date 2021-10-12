import { Client, Message } from 'discord.js';
import { inject, injectable } from 'inversify';
import { TYPES } from './types';
import * as chalk from 'chalk';
import { MessageHandlerService } from './message-handler/message-handler-service';
import { MessageBroker } from './message-broker';
import { ScheduledMessengerService } from './scheduler/scheduled-messenger-service';

@injectable()
export class Bot {

  constructor(
    @inject(TYPES.Client) private client: Client,
    @inject(TYPES.Token) private token: string,
    @inject(TYPES.MessageBroker) private messageBroker: MessageBroker,
    @inject(TYPES.MessageHandlerService) private messageHandlerService: MessageHandlerService,
    @inject(TYPES.ScheduledMessengerService) private scheduledMessengerService: ScheduledMessengerService
  ) { }

  public setup(): Promise<string> {
    this.client.on('message', (message: Message) => {
      if (message.author.bot) {
        console.log(chalk.red('Ignoring bot message!'));
        return;
      }
      this.messageBroker.dispatchMessageReceived(message);
    });
    this.messageBroker.onSendMessage$.subscribe((messageText: string) => this.sendMessage(messageText));

    // Register handlers and scheduled messages
    this.messageHandlerService.registerResponder();
    this.scheduledMessengerService.registerScheduler();

    return this.client.login(this.token);
  }

  public sendMessage(messageText: string) {
    // Todo: Logic for transmitting messages
  }
}
