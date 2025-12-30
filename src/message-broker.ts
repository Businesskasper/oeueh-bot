import { CommandInteraction, Message } from "discord.js";
import { injectable } from "inversify";
import { ReplaySubject, Subject } from "rxjs";
import { SendMessageModel } from "./models/send-message.model";
import { SlashCommand } from "./slash-commands/slash-command";

@injectable()
export class MessageBroker {
    public onMessageReceived$: Subject<Message | CommandInteraction> =
        new Subject<Message | CommandInteraction>();
    public onSendMessage$: Subject<SendMessageModel> =
        new Subject<SendMessageModel>();
    public onCommandsRegistered$: ReplaySubject<SlashCommand[]> =
        new ReplaySubject<SlashCommand[]>();

    public dispatchMessageReceived(message: Message | CommandInteraction) {
        this.onMessageReceived$.next(message);
    }

    public dispatchSendMessage(sendMessageModel: SendMessageModel) {
        this.onSendMessage$.next(sendMessageModel);
    }

    public dispatchCommandsRegistered(commands: SlashCommand[]) {
        this.onCommandsRegistered$.next(commands);
    }
}
