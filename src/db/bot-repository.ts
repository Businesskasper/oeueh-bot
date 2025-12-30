import { inject, injectable } from "inversify";
import { ReminderModel } from "../models/reminder.model";
import { SoundCommandModel } from "../models/sound-command.model";
import { TYPES } from "../types";
import { DbService } from "./db-service";

@injectable()
export class BotRepository {
    constructor(@inject(TYPES.DbService) private _dbService: DbService) {}

    public GetReminder(): ReminderModel[] {
        return this._dbService.GetReminder();
    }

    public AddReminder(reminder: ReminderModel): void {
        this._dbService.AddReminder(reminder);
    }

    public DeleteReminder(reminderId: number): void {
        this._dbService.DeleteReminder(reminderId);
    }

    public AddSoundCommand(soundCommand: SoundCommandModel): void {
        this._dbService.AddSoundCommand(soundCommand);
    }

    public GetSoundCommands(): SoundCommandModel[] {
        return this._dbService.GetSoundCommands();
    }

    public DeleteSoundCommand(soundCommandId: number): void {
        this._dbService.DeleteSoundCommand(soundCommandId);
    }
}
