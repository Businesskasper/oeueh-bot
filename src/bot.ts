import { Client, Message } from 'discord.js';
import { inject, injectable } from 'inversify';
import { TYPES } from './types';
import { MessageResponder } from './services/message-responder';
import * as chalk from 'chalk';

const log = console.log;

@injectable()
export class Bot {
  private client: Client;
  private readonly token: string;
  private messageResponder: MessageResponder;

  constructor(
    @inject(TYPES.Client) client: Client,
    @inject(TYPES.Token) token: string,
    @inject(TYPES.MessageResponder) messageResponder: MessageResponder
  ) {
    this.messageResponder = messageResponder;
    this.token = token;
    this.client = client;
  }

  public listen(): Promise<string> {
    this.client.on('message', (message: Message) => {
      if (message.author.bot) {
        console.log(chalk.red('Ignoring bot message!'));
        return;
      }

      log('*************');
      log('Message received! Contents: ', chalk.bgGray.bold(message.content));
      log('*************');

      this.messageResponder
        .handle(message)
        .then(() => {
          log(chalk.green.bold('Response sent!'));
        })
        .catch(() => {
          log(chalk.red.bold('Response sent!'));
        });
    });

    return this.client.login(this.token);
  }
}
