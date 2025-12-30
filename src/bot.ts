import {
    Channel,
    Client,
    Message,
    MessageOptions,
    TextChannel,
} from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "./types";
import * as chalk from "chalk";
import { MessageBroker } from "./message-broker";
import { SendMessageModel } from "./models/send-message.model";
import { LoggingService } from "./logging.service";

@injectable()
export class Bot {
    constructor(
        @inject(TYPES.Client) private client: Client,
        @inject(TYPES.Token) private token: string,
        @inject(TYPES.MessageBroker) private messageBroker: MessageBroker,
        @inject(TYPES.LoggingService) private loggingService: LoggingService,
    ) {}

    public setup(): Promise<string> {
        this.client.on("message", (message: Message) => {
            if (message.author.bot) {
                this.loggingService.LogMessage("Ignoring bot message", false);
                return;
            }
            this.messageBroker.dispatchMessageReceived(message);
        });
        this.messageBroker.onSendMessage$.subscribe(
            (sendMessage: SendMessageModel) =>
                this.sendMessage(
                    sendMessage.messageText,
                    sendMessage.channelId,
                ),
        );

        return this.client.login(this.token);
    }

    public sendMessage(content: string, channelId: string) {
        this.client.channels
            .fetch(channelId)
            .then((channel: TextChannel) => channel.send({ content }));
    }
}
