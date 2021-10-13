import { inject, injectable } from "inversify";
import { AppSettings } from "../app-settings";
import { MessageBroker } from "../message-broker";
import { TYPES } from "../types";
import { IScheduledMessenger } from "./ischeduled-messenger";

@injectable()
export class StretchScheduledMessenger implements IScheduledMessenger {

    constructor(
        @inject(TYPES.MessageBroker) private messageBroker: MessageBroker,
        @inject(TYPES.AppSettings) private appSettings: AppSettings
    ) { }

    private sendReminder() {
        this.messageBroker.dispatchSendMessage({messageText: 'Strecken nicht vergessen!', channelId: this.appSettings.MessageChannelId});
    }

    setupSchedule(): void {
        // TODO () => this.sendReminder();
    }
}