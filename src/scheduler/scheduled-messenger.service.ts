import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { IScheduledMessenger } from "./ischeduled-messenger";
import { StretchScheduledMessenger } from "./stretch-scheduled-messenger";

@injectable()
export class ScheduledMessengerService {

    private schedulers: IScheduledMessenger[] = Array<IScheduledMessenger>();

    constructor(@inject(TYPES.StretchScheduledMessenger) private stretchScheduler: StretchScheduledMessenger) { }

    public registerScheduler(): void {
        this.schedulers.push(this.stretchScheduler);
        this.schedulers.forEach((scheduler: IScheduledMessenger) => scheduler.setupSchedule());
    }
}