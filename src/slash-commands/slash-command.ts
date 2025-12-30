import {
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import { CommandInteraction, Interaction } from "discord.js";
import { injectable } from "inversify";
import { Subject } from "rxjs";

@injectable()
export abstract class SlashCommand {
    constructor() {}

    public commandRefreshed$: Subject<void> = new Subject<void>();

    public abstract command:
        | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
        | SlashCommandSubcommandsOnlyBuilder;

    public abstract Handle(interaction: CommandInteraction): void;
}
