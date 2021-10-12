import { Message } from "discord.js";
import { injectable } from "inversify";
import { Subject } from "rxjs";

@injectable()
export class MessageBroker {

    public onMessageReceived$: Subject<Message> = new Subject<Message>();
    public onSendMessage$: Subject<string> = new Subject<string>();

    public dispatchMessageReceived(message: Message) {
        this.onMessageReceived$.next(message);
    }

    public dispatchSendMessage(messageText: string) {
        this.onSendMessage$.next(messageText);
    }
}