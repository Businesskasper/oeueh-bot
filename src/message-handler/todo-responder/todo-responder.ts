import { Message } from "discord.js";
import { injectable } from "inversify";
import { shuffleArray } from "../../utils/utils";
import { IMessageHandler } from "../imessage-handler";
import { todos } from "./todos";

@injectable()
export class TodoResponder implements IMessageHandler {
    
    private regex: string = 'todo';

    async Handle(message: Message): Promise<void> {
        if (message.content.match(this.regex)) {
            await message.reply(shuffleArray<string>(todos));
        }
    }

}
