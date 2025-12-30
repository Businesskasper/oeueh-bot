import chalk = require("chalk");
import { inject, injectable } from "inversify";
import { AppSettings } from "./app-settings";
import { MessageBroker } from "./message-broker";
import { TYPES } from "./types";

@injectable()
export class LoggingService {
    constructor(
        @inject(TYPES.MessageBroker)
        private messageBroker: MessageBroker,
        @inject(TYPES.AppSettings)
        private appSettings: AppSettings,
        @inject(TYPES.Log) private log: (message: any) => void,
    ) {}

    public LogMessage(message: string, logToDiscord: boolean = true): void {
        const formattedMessage = `${this.getFormattedDateTime()}: ${message}`;
        this.log(chalk.green.bold(formattedMessage));
        if (logToDiscord) {
            this.logToDiscord(formattedMessage);
        }
    }

    public LogWarning(message: string, logToDiscord: boolean = true): void {
        const formattedMessage = `${this.getFormattedDateTime()}: WARNING - ${message}`;
        this.log(chalk.yellow.bold(formattedMessage));
        if (logToDiscord) {
            this.logToDiscord(formattedMessage);
        }
    }

    public LogError(message: string, logToDiscord: boolean = true): void {
        const formattedMessage = `${this.getFormattedDateTime()}: ERROR - ${message}`;
        this.log(chalk.red.bold(formattedMessage));
        if (logToDiscord) {
            this.logToDiscord(formattedMessage);
        }
    }

    private logToDiscord(formattedMessage: string) {
        this.messageBroker.dispatchSendMessage({
            channelId: this.appSettings.LogChannelId,
            messageText: formattedMessage,
        });
    }

    private getFormattedDateTime(): string {
        const now: Date = new Date();
        return `${now.getDate()}.${
            now.getMonth() + 1
        }.${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    }
}
