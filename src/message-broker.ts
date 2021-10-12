import { Message } from "discord.js";
import { injectable } from "inversify";
import { Observable, Subject } from "rxjs";

@injectable()
export class MessageBroker {

    public onMessageReceived$: Subject<Message> = new Subject<Message>();

    public dispatchMessageReceived(message: Message) {
        this.onMessageReceived$.next(message);
    }
}