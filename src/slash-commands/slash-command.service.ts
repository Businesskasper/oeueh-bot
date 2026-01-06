import { CommandInteraction } from "discord.js";
import { inject, injectable } from "inversify";
import { filter } from "rxjs";
import { MessageBroker } from "../message-broker";
import { TYPES } from "../types";
import { ReminderCommand } from "./commands/reminder-command";
import { SlashCommand } from "./slash-command";

@injectable()
export class SlashCommandService {
    private slashCommands: Array<SlashCommand> = new Array<SlashCommand>();

    constructor(
        @inject(TYPES.MessageBroker)
        private messageBroker: MessageBroker,
        @inject(TYPES.ReminderCommand)
        private reminderCommand: ReminderCommand,
    ) {
        // Discover SlashCommands via reflection
        this.slashCommands = Reflect.ownKeys(this)
            .map((key) => this[key as keyof SlashCommandService])
            .filter(
                (item) => item instanceof SlashCommand,
            ) as unknown as Array<SlashCommand>;

        this.slashCommands.forEach((slashCommand: SlashCommand) =>
            this.messageBroker.onInteractionReceived$
                .pipe(
                    filter(
                        (interaction) =>
                            interaction instanceof CommandInteraction,
                    ),
                    filter(
                        (interaction: CommandInteraction) =>
                            interaction.commandName ==
                            slashCommand.command.name,
                    ),
                )
                .subscribe((interaction: CommandInteraction) =>
                    slashCommand.Handle(interaction),
                ),
        );
    }

    public registerCommands(): void {
        this.messageBroker.dispatchCommandsRegistered(this.slashCommands);
    }

    public dispose(): void {
        this.slashCommands.forEach((slashCommand: SlashCommand) => {
            if (slashCommand.dispose) {
                slashCommand.dispose();
            }
        });
    }

    // private loadCommands(): void {
    //     const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    //     for (const file of commandFiles) {
    //         const command = require(`./commands/${file}`);
    //         this.slashCommands.push(command);
    //     }
    // }
}
