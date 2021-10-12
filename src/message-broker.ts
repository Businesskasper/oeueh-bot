import { Message } from "discord.js";
import { injectable } from "inversify";
import { Subject } from "rxjs";
import { SendMessageModel } from "./models/send-message.model";

@injectable()
export class MessageBroker {

    public onMessageReceived$: Subject<Message> = new Subject<Message>();
    public onSendMessage$: Subject<SendMessageModel> = new Subject<SendMessageModel>();

    public dispatchMessageReceived(message: Message) {
        this.onMessageReceived$.next(message);
    }

    public dispatchSendMessage(sendMessageModel: SendMessageModel) {
        this.onSendMessage$.next(sendMessageModel);
    }
}