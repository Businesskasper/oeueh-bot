import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Interaction } from "discord.js";
import { injectable } from "inversify";

@injectable()
export abstract class SlashCommand {
    constructor() {}

    public abstract command: Omit<
        SlashCommandBuilder,
        "addSubcommand" | "addSubcommandGroup"
    >;

    public abstract Handle(interaction: CommandInteraction): void;
}
