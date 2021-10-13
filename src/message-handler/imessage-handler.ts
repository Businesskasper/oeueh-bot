import { Message } from "discord.js";

export interface IMessageHandler {
    Handle(message: Message): Promise<void>;
}