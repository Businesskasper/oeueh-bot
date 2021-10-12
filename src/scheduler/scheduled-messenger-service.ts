import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { IScheduledMessenger } from "./ischeduled-messenger";
import { StretchScheduledMessenger } from "./stretch-scheduled-messenger";
import { TwitchScheduledMessenger } from "./twitch-scheduled-messenger";

@injectable()
export class ScheduledMessengerService {
    private schedulers: IScheduledMessenger[] = Array<IScheduledMessenger>();

    constructor(
        @inject(TYPES.StretchScheduledMessenger)
        private stretchScheduler: StretchScheduledMessenger,
        @inject(TYPES.TwitchScheduledMessenger)
        private twitchScheduler: TwitchScheduledMessenger
    ) {}

    public registerScheduler(): void {
        this.schedulers.push(this.stretchScheduler);
        this.schedulers.push(this.twitchScheduler);
        this.stretchScheduler.setupSchedule();
        this.twitchScheduler.setupSchedule();
    }
}
