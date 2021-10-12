import { Client, Message } from 'discord.js';
import { inject, injectable } from 'inversify';
import { TYPES } from './types';
import * as chalk from 'chalk';
import { IMessageHandler } from './message-handler/imessage-handler';
import { MessageHandlerService } from './message-handler/message-handler-service';
import { MessageBroker } from './message-broker';

@injectable()
export class Bot {

  constructor(
    @inject(TYPES.Client) private client: Client,
    @inject(TYPES.Token) private token: string,
    @inject(TYPES.MessageBroker) private messageBroker: MessageBroker,
    @inject(TYPES.MessageHandlerService) private messageHandlerService: MessageHandlerService
  ) {
    this.messageHandlerService.registerResponder();
  }

  public listen(): Promise<string> {
    this.client.on('message', (message: Message) => {
      if (message.author.bot) {
        console.log(chalk.red('Ignoring bot message!'));
        return;
      }
      this.messageBroker.dispatchMessageReceived(message);
    });

    return this.client.login(this.token);
  }
}
