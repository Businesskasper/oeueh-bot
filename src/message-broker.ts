import { CacheType, Interaction, Message } from "discord.js";
import { injectable } from "inversify";
import { ReplaySubject, Subject } from "rxjs";
import { SendMessageModel } from "./models/send-message.model";
import { SlashCommand } from "./slash-commands/slash-command";

@injectable()
export class MessageBroker {
    public onMessageReceived$: Subject<Message> = new Subject<Message>();
    public onInteractionReceived$: Subject<Interaction<CacheType>> =
        new Subject<Interaction<CacheType>>();
    public onSendMessage$: Subject<SendMessageModel> =
        new Subject<SendMessageModel>();
    public onCommandsRegistered$: ReplaySubject<SlashCommand[]> =
        new ReplaySubject<SlashCommand[]>();

    public dispatchMessageReceived(message: Message) {
        this.onMessageReceived$.next(message);
    }

    public dispatchInteractionReceived(interaction: Interaction<CacheType>) {
        this.onInteractionReceived$.next(interaction);
    }

    public dispatchSendMessage(sendMessageModel: SendMessageModel) {
        this.onSendMessage$.next(sendMessageModel);
    }

    public dispatchCommandsRegistered(commands: SlashCommand[]) {
        this.onCommandsRegistered$.next(commands);
    }
}
