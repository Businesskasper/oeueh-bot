import { CommandInteraction } from "discord.js";
import { inject, injectable } from "inversify";
import { filter } from "rxjs";
import { MessageBroker } from "../message-broker";
import { TYPES } from "../types";
import { ReminderCommand } from "./commands/reminder-command";
import { SoundCommand } from "./commands/sound-command";
import { SlashCommand } from "./slash-command";
// import * as fs from 'fs';

@injectable()
export class SlashCommandService {

    private slashCommands: Array<SlashCommand> = new Array<SlashCommand>();
    
    constructor(
        @inject(TYPES.MessageBroker) private messageBroker: MessageBroker,
        @inject(TYPES.ReminderCommand) private reminderCommand: ReminderCommand,
        // @inject(TYPES.AddSoundCommand) private addSoundCommand: AddSoundCommand,
        // @inject(TYPES.PlaySoundCommand) private playSoundCommand: PlaySoundCommand,
        @inject(TYPES.SoundCommand) private soundCommand: SoundCommand
    ) {
        this.slashCommands = Reflect.ownKeys(this)
            .map(key => this[key])
            .filter(item => item.__proto__ instanceof SlashCommand);

        this.slashCommands.forEach((slashCommand: SlashCommand) => {
            slashCommand.commandRefreshed$.subscribe(_ => this.RefreshCommands())
            this.messageBroker.onMessageReceived$
                .pipe(
                    filter(interaction => interaction instanceof CommandInteraction),
                    filter((interaction: CommandInteraction) => interaction.commandName == slashCommand.command.name)
                )
                .subscribe((interaction: CommandInteraction) => slashCommand.Handle(interaction));
        })
    }

    public registerCommands(): void {
        this.messageBroker.dispatchCommandsRegistered(this.slashCommands);
    }

    private RefreshCommands(): void {
        this.registerCommands()
    }
}