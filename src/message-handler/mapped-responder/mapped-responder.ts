import { Message } from "discord.js";
import { injectable } from "inversify";
import { IMessageHandler } from "../imessage-handler";

@injectable()
export class MappedResponder implements IMessageHandler {
    
    private regex: string;
    private response: string;

    constructor() { }

    setup(regex: string, response: string): void {
        this.regex = regex;
        this.response = response;
    }

    async Handle(message: Message): Promise<void> {
        if (message.content.search(this.regex) >= 0) {
            await message.reply(this.response);
        }
    }
}