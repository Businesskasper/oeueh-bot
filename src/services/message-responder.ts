import { Message } from "discord.js";
import { PingFinder } from "./ping-finder";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { PenisFinder } from "./penis-finder";

@injectable()
export class MessageResponder {
  private pingFinder: PingFinder;
  private penisFinder: PenisFinder;

  constructor(
    @inject(TYPES.PingFinder) pingFinder: PingFinder, 
    @inject(TYPES.PenisFinder) penisFinder: PenisFinder) { 
      this.pingFinder = pingFinder;
      this.penisFinder = penisFinder;
    }

  handle(message: Message): Promise<Message | Message[]> {
    if (this.pingFinder.isPing(message.content)) {
      return message.reply('pong!');
    }
    else if(this.penisFinder.isPenis(message.content)) {
      return message.reply('fotze');
    }

    return Promise.reject();
  }
}