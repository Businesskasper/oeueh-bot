import * as bettersqlite3 from "better-sqlite3";
import * as fs from "fs";
import { injectable } from "inversify";
import { ReminderModel } from "../models/reminder-model";

@injectable()
export class DbService {
    private _database: bettersqlite3.Database;

    constructor(dbPath: string) {
        this._database = new bettersqlite3(dbPath, { verbose: console.log });
    }

    public InitializeDatabase(dbSetupFile: string): DbService {
        this._database.exec(
            fs.readFileSync(dbSetupFile, { encoding: "utf-8" }),
        );
        return this;
    }

    private ExecNonQuery(nonQuery: string, params: any[] = null): void {
        this._database.prepare(nonQuery?.trim()).run(params);
    }

    private ExecQuery<T>(query: string, params: any[] = []): T[] {
        return <T[]>this._database.prepare(query?.trim()).all(params);
    }

    public GetReminder(): ReminderModel[] {
        return this.ExecQuery<ReminderModel>(
            `select id, userId, message, date from Reminder`,
        ).map((reminder) => {
            reminder.date = new Date(reminder.date);
            return reminder;
        });
    }

    public AddReminder(reminder: ReminderModel): void {
        let { userId, message, date } = reminder;
        this.ExecNonQuery(
            `REPLACE INTO Reminder (userId, message, date) VALUES (?, ?, ?)`,
            [userId, message, date.valueOf().toString()],
        );
    }

    public DeleteReminder(id: number): void {
        this.ExecNonQuery(`DELETE FROM Reminder WHERE id = ?`, [id]);
    }
}
