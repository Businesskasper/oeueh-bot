import chalk = require("chalk");
import { inject, injectable } from "inversify";
import { appSettings, AppSettings } from "./app-settings";
import { MessageBroker } from "./message-broker";
import { TYPES } from "./types";

@injectable()
export class LoggingService {

    constructor(
        @inject(TYPES.MessageBroker) private messageBroker: MessageBroker,
        @inject(TYPES.AppSettings) private appSettings: AppSettings
    ) { }

    public LogMessage(message: string, logToDiscord: boolean = true): void {
        let formattedMessage = `${this.getFormattedDateTime()}: ${message}`;
        console.log(chalk.green.bold(formattedMessage));
        if (logToDiscord) {
            this.logToDiscord(formattedMessage);
        }
    }

    public LogWarning(message: string, logToDiscord: boolean = true): void {
        let formattedMessage = `${this.getFormattedDateTime()}: WARNING - ${message}`;
        console.log(chalk.yellow.bold(formattedMessage));
        if (logToDiscord) {
            this.logToDiscord(formattedMessage);
        }
    }

    public LogError(message: string, logToDiscord: boolean = true): void {
        let formattedMessage = `${this.getFormattedDateTime()}: ERROR - ${message}`;
        console.log(chalk.red.bold(formattedMessage));
        if (logToDiscord) {
            this.logToDiscord(formattedMessage);
        }
    }

    private logToDiscord(formattedMessage: string) {
        this.messageBroker.dispatchSendMessage({ channelId: this.appSettings.LogChannelId, messageText: formattedMessage });
    }

    private getFormattedDateTime(): string {
        let now: Date = new Date();
        return `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    }
}