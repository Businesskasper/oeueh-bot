import { inject, injectable } from "inversify";
import { MessageBroker } from "../message-broker";
import { TYPES } from "../types";
import { IScheduledMessenger } from "./ischeduled-messenger";
import * as cron from "node-cron";
import { TwitchAPI } from "../twitch/twitch-api";

@injectable()
export class TwitchScheduledMessenger implements IScheduledMessenger {
    constructor(
        @inject(TYPES.MessageBroker) private messageBroker: MessageBroker
    ) {}

    private sendReminder(user_name: string, user_link: string) {
        this.messageBroker.dispatchSendMessage(
            `Aktuell ist ${user_name} live! https://www.twitch.tv/${user_link}`
        );
    }

    setupSchedule(): void {
        cron.schedule("0 * * * *", () => {
            let twitch = new TwitchAPI(
                process.env.CLIENT_ID,
                process.env.CLIENT_SECRET
            );

            twitch.getAccessToken().then((token) => {
                twitch
                    .getLiveStreams(token, [
                        "39043515",
                        "190835892",
                        "36029255",
                    ])
                    .then((streams: any[]) => {
                        streams.forEach((stream) => {
                            if (stream.is_live) {
                                this.sendReminder(
                                    stream?.user_data?.user_name,
                                    stream?.user_data?.user_login
                                );
                            }
                        });
                    });
            });
        });
    }
}
