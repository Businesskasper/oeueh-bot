import { CommandInteraction, Message } from "discord.js";
import { injectable } from "inversify";
import { ReplaySubject, Subject } from "rxjs";
import { PlaySoundModel } from "./models/play-sound.model";
import { SendMessageModel } from "./models/send-message.model";
import { SlashCommand } from "./slash-commands/slash-command";

@injectable()
export class MessageBroker {

    public onMessageReceived$: Subject<Message | CommandInteraction> = new Subject<Message | CommandInteraction>();
    public onSendMessage$: Subject<SendMessageModel> = new Subject<SendMessageModel>();
    public onPlaySound$: Subject<PlaySoundModel> = new Subject<PlaySoundModel>();
    public onStopSound$: Subject<string> = new Subject<string>();
    public onCommandsRegistered$: ReplaySubject<SlashCommand[] | SlashCommand> = new ReplaySubject<SlashCommand[] | SlashCommand>();

    public dispatchMessageReceived(message: Message | CommandInteraction) {
        this.onMessageReceived$.next(message);
    }

    public dispatchSendMessage(sendMessageModel: SendMessageModel) {
        this.onSendMessage$.next(sendMessageModel);
    }

    public dispatchCommandsRegistered(commands: SlashCommand[] | SlashCommand) {
        this.onCommandsRegistered$.next(commands);
    }

    public dispatchPlaySoundToUser(playSoundModel: PlaySoundModel) {
        this.onPlaySound$.next(playSoundModel);
    }

    public dispatchStopSound(userId: string): void {
        this.onStopSound$.next(userId);
    }
}