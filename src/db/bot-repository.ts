import { inject } from "inversify";
import { ReminderModel } from "../models/reminder-model";
import { TYPES } from "../types";
import { DbService } from "./db-service";

export class BotRepository {

    constructor(@inject(TYPES.DbService) private _dbService: DbService) { }

    public GetReminder(): ReminderModel[] {
        return new Array<ReminderModel>();
    }
}