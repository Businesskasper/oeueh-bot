import * as bettersqlite3 from 'better-sqlite3';
import * as fs from 'fs';
import { ReminderModel } from '../models/reminder-model';

export class DbService {

    private _database: bettersqlite3.Database;

    constructor(dbPath: string) {
        this._database = new bettersqlite3(dbPath, {verbose: console.log});
    }

    public InitializeDatabase(dbSetupFile: string): DbService {
        this._database.exec(fs.readFileSync(dbSetupFile, {encoding: 'utf-8'}));
		return this;
    }

    private ExecNonQuery(nonQuery: string, params: any[] = null): void {
        this._database.prepare(nonQuery?.trim()).run(params);
    }

    private ExecQuery<T>(query: string, params: any[] = []): T[] {
        return <T[]>(this._database.prepare(query?.trim()).all(params));
    }

    public GetReminder(): ReminderModel[] {
        return this.ExecQuery<ReminderModel>(`select id, userId, message, date from Reminder`);
    }

    public AddReminder(reminder: ReminderModel): void {
        let {userId, message, date} = reminder;
        this.ExecQuery(`REPLACE INTO Reminder (userId, message, date) VALUES (?, ?, ?)`, [userId, message, date])
    }

    // public InsertServer(hostName: string, countInfoma: number, countITS: number, inventoryDate: string): void {
		
    //     let insertString = `
    //         REPLACE INTO Server (HostName, CountInfoma, CountITS, InventoryDate) 
    //         VALUES (?, ?, ?, ?)
    //     `;
        
    //     this.ExecNonQuery(insertString, [hostName?.trim().toUpperCase(), countInfoma, countITS, inventoryDate]);
    // }

    // public GetServer(hostName: string = undefined): Server[] {

    //     let result: Server[] = (hostName !== undefined && hostName.trim() !== "") ? 
    //         this.ExecQuery<Server>('SELECT * FROM Server WHERE HostName = ?', [hostName.trim().toUpperCase()]) :
    //         this.ExecQuery<Server>('SELECT * FROM Server');
    
    //     return [].concat(result);
    // }

    // public DeleteServer(serverToDelete: Server): void {

    //     this.ExecNonQuery('DELETE FROM Server WHERE HostName = ?' , [serverToDelete.HostName]);
    // }
}