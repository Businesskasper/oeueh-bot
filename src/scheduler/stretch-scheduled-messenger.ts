import { inject, injectable } from "inversify";
import { MessageBroker } from "../message-broker";
import { TYPES } from "../types";
import { IScheduledMessenger } from "./ischeduled-messenger";
import * as cron from "node-cron";

@injectable()
export class StretchScheduledMessenger implements IScheduledMessenger {
    constructor(
        @inject(TYPES.MessageBroker) private messageBroker: MessageBroker
    ) {}

    private sendReminder() {
        this.messageBroker.dispatchSendMessage("Strecken nicht vergessen!");
    }

    setupSchedule(): void {
        // Cronshit () => setReminder()
        cron.schedule("0 * * * *", async () => {
            this.sendReminder();
        });
    }
}
