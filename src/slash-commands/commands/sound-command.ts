import {
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import { CacheType, CommandInteraction } from "discord.js";
import * as fs from "fs";
import { inject, injectable } from "inversify";
import ytdl from "ytdl-core";
import { BotRepository } from "../../db/bot-repository";
import { LoggingService } from "../../logging.service";
import { MessageBroker } from "../../message-broker";
import { TYPES } from "../../types";
import { SlashCommand } from "../slash-command";

@injectable()
export class SoundCommand extends SlashCommand {
    constructor(
        @inject(TYPES.BotRepository)
        private botRepository: BotRepository,
        @inject(TYPES.MessageBroker)
        private messageBroker: MessageBroker,
        @inject(TYPES.LoggingService)
        private logger: LoggingService,
    ) {
        super();
    }

    public command:
        | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
        | SlashCommandSubcommandsOnlyBuilder = this.BuildCommand();

    public Handle(interaction: CommandInteraction<CacheType>): void {
        const subCommand = interaction.options.getSubcommand();
        if (subCommand == "add") {
            this.HandleAddCommand(interaction);
        } else if (subCommand == "play") {
            this.HandlePlayCommand(interaction);
        } else if (subCommand == "delete") {
            this.HandleDeleteCommand(interaction);
        } else if (subCommand == "stop") {
            this.HandleStopCommand(interaction);
        }
    }

    private HandleStopCommand(interaction: CommandInteraction<CacheType>) {
        this.messageBroker.dispatchStopSound(interaction.user.id);
        interaction.reply({ content: "Done", ephemeral: true });
    }

    private HandleAddCommand(interaction: CommandInteraction<CacheType>) {
        const soundName = interaction.options.getString("name", true);
        const soundUrl = interaction.options.getString("url", true);
        const filePath = `./sounds/${soundName}.mp3`;

        interaction.deferReply({ ephemeral: true }).then((_) => {
            this.getVideoInfo(soundUrl).then((videoInfo) => {
                // const videoTitle = videoInfo.videoDetails.title
                const videoLength = <number>(
                    videoInfo.videoDetails.lengthSeconds
                );
                if (videoLength < 10) {
                    this.downloadVideo(soundUrl, filePath)
                        .then((_) => {
                            this.logger.LogMessage(
                                `Video heruntergeladen nach ${filePath}`,
                                false,
                            );
                            interaction.editReply({ content: `Done` });
                            this.botRepository.AddSoundCommand({
                                commandName: soundName,
                                filePath,
                            });
                            this.command = this.BuildCommand();
                            this.commandRefreshed$.next();
                        })
                        .catch((error) =>
                            this.logger.LogError(
                                `Download fehlgeschlagen!`,
                                false,
                            ),
                        );
                } else {
                    interaction.editReply({ content: `Done` });
                    this.botRepository.AddSoundCommand({
                        commandName: soundName,
                        link: soundUrl,
                    });
                    this.command = this.BuildCommand();
                    this.commandRefreshed$.next();
                }
            });
        });
    }

    private HandlePlayCommand(interaction: CommandInteraction<CacheType>) {
        const soundName = interaction.options.getString("name", true);
        const soundCommand = this.botRepository
            .GetSoundCommands()
            .find((soundCommand) => soundCommand.commandName == soundName);
        this.messageBroker.dispatchPlaySoundToUser({
            userId: interaction.user.id,
            filePath: soundCommand.filePath,
            url: soundCommand.link,
        });
        interaction.reply({
            content: `*${soundName}*`,
            ephemeral: true,
        });
    }

    private HandleDeleteCommand(interaction: CommandInteraction<CacheType>) {
        const soundName = interaction.options.getString("name", true);
        const soundCommand = this.botRepository
            .GetSoundCommands()
            .find((soundCommand) => soundCommand.commandName == soundName);
        this.botRepository.DeleteSoundCommand(soundCommand.id);
        const filePath = `./sounds/${soundName}.mp3`;
        fs.rmSync(filePath, { force: true });
        this.commandRefreshed$.next();
        interaction.reply({
            content: `*${soundName}* gelöscht`,
            ephemeral: true,
        });
    }

    private BuildCommand():
        | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
        | SlashCommandSubcommandsOnlyBuilder {
        const soundCommands = this.botRepository
            .GetSoundCommands()
            .map((soundCommand) => soundCommand.commandName);
        return new SlashCommandBuilder()
            .setName("sound")
            .setDescription("Youtube Player")
            .addSubcommand((subCommand) =>
                subCommand
                    .setName("add")
                    .setDescription("Wat speichern")
                    .addStringOption((option) =>
                        option
                            .setName("name")
                            .setDescription(
                                "Auf welchen Command soll das Video gespielt werden?",
                            )
                            .setRequired(true),
                    )
                    .addStringOption((option) =>
                        option
                            .setName("url")
                            .setDescription("Die url des Videos")
                            .setRequired(true),
                    ),
            )
            .addSubcommand((subCommand) =>
                subCommand
                    .setName("play")
                    .setDescription("Wat abspielen")
                    .addStringOption((option) =>
                        option
                            .setName("name")
                            .setDescription("Der gespeicherte Sound")
                            .addChoices(
                                soundCommands.map((command) => [
                                    command,
                                    command,
                                ]),
                            )
                            .setRequired(true),
                    ),
            )
            .addSubcommand((subCommand) =>
                subCommand
                    .setName("delete")
                    .setDescription("Video rausschmeißen")
                    .addStringOption((option) =>
                        option
                            .setName("name")
                            .setDescription("Der gespeicherte Sound")
                            .addChoices(
                                soundCommands.map((command) => [
                                    command,
                                    command,
                                ]),
                            )
                            .setRequired(true),
                    ),
            )
            .addSubcommand((subCommand) =>
                subCommand
                    .setName("stop")
                    .setDescription("Stoppt die aktuelle Wiedergabe"),
            );
    }

    private getVideoInfo(videoUrl: string): Promise<any> {
        return ytdl.getInfo(videoUrl);
    }

    private downloadVideo(videoUrl: string, filePath: string): Promise<void> {
        const download = ytdl(videoUrl, {
            filter: "audioonly",
        });
        const writeStream = fs.createWriteStream(filePath);
        download.pipe(writeStream);
        return new Promise((resolve, reject) => {
            writeStream.on("error", (err) => reject(err));
            writeStream.on("finish", () => resolve());
        });
    }
}
