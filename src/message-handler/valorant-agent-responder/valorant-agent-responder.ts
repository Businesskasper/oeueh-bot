import { Message } from 'discord.js';
import { injectable } from 'inversify';
import { shuffleArray } from '../../utils/utils';
import { IMessageHandler } from '../imessage-handler';
import { agents } from './valorant-agents';

@injectable()
export class ValorantAgentResponder implements IMessageHandler {

    private regex: string = 'agent';

    async Handle(message: Message): Promise<void> {
        if (message.content.match(this.regex)) {
            await message.reply(`du spielst ${shuffleArray<string>(agents)}!`)
        }
    }
}
