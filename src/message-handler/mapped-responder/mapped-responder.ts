import { Message } from "discord.js";
import { injectable } from "inversify";
import { shuffleArray } from "../../utils/utils";
import { IMessageHandler } from "../imessage-handler";

@injectable()
export class MappedResponder implements IMessageHandler {

    private regex: string;
    private response: string | string[];

    constructor() { }

    setup(regex: string, response: string | string[]): void {
        this.regex = regex;
        this.response = response;
    }

    async Handle(message: Message): Promise<void> {
        if (message.content.search(this.regex) >= 0) {
            let response = Array.isArray(this.response) ? shuffleArray(this.response) : this.response;
            await message.reply(response);
        }
    }
}