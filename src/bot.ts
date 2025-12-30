import { REST } from "@discordjs/rest";
import {
    AudioPlayer,
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    StreamType,
    VoiceConnection,
} from "@discordjs/voice";
import { Routes } from "discord-api-types/v9";
import {
    Channel,
    Client,
    CommandInteraction,
    Message,
    TextChannel,
    User,
} from "discord.js";
import { inject, injectable } from "inversify";
import { FFmpeg } from "prism-media";
import { debounceTime } from "rxjs";
import { LoggingService } from "./logging.service";
import { MessageBroker } from "./message-broker";
import { PlaySoundModel } from "./models/play-sound.model";
import { SendMessageModel } from "./models/send-message.model";
import { SlashCommand } from "./slash-commands/slash-command";
import { TYPES } from "./types";
import ytdl = require("ytdl-core");

const FFMPEG_OPUS_ARGUMENTS = ["-f", "s16le", "-ar", "48000", "-ac", "2"];

@injectable()
export class Bot {
    private playerMap: Map<
        string,
        { player: AudioPlayer; voiceChat: VoiceConnection }
    > = new Map<string, any>();

    constructor(
        @inject(TYPES.Client) private client: Client,
        @inject(TYPES.Token) private token: string,
        @inject(TYPES.MessageBroker)
        private messageBroker: MessageBroker,
        @inject(TYPES.LoggingService)
        private loggingService: LoggingService,
        @inject(TYPES.ClientId) private clientId: string,
        @inject(TYPES.GuildId) private guildId: string,
    ) {}

    public setup(): Promise<Bot> {
        this.client.on("messageCreate", (message: Message) => {
            if (message.author.bot) {
                this.loggingService.LogMessage("Ignoring bot message", false);
                return;
            }
            this.messageBroker.dispatchMessageReceived(message);
        });

        this.client.on(
            "interactionCreate",
            (interaction: CommandInteraction) => {
                this.messageBroker.dispatchMessageReceived(interaction);
            },
        );

        this.messageBroker.onSendMessage$.subscribe(
            (sendMessage: SendMessageModel) =>
                this.sendMessage(
                    sendMessage.messageText,
                    sendMessage.channelId,
                    sendMessage.userId,
                ),
        );

        this.messageBroker.onCommandsRegistered$
            .pipe(debounceTime(300))
            .subscribe((slashCommands: SlashCommand[]) =>
                this.registerSlashCommands(slashCommands),
            );

        this.messageBroker.onPlaySound$.subscribe(
            (playSoundModel: PlaySoundModel) =>
                this.playSoundToUser(
                    playSoundModel.userId,
                    playSoundModel.filePath,
                    playSoundModel.url,
                ),
        );

        this.messageBroker.onStopSound$.subscribe(
            (stopSoundForUserId: string) =>
                this.stopSoundToUser(stopSoundForUserId),
        );

        return new Promise((resolve, reject) => {
            this.client
                .login(this.token)
                .then((_) => resolve(this))
                .catch((err) => {
                    reject(err);
                });
        });
    }

    private registerSlashCommands(
        slashCommands: SlashCommand[],
    ): Promise<void> {
        const commandsToRegister = slashCommands.map((slashCommand) =>
            slashCommand.command.toJSON(),
        );
        const rest = new REST({ version: "9" }).setToken(this.token);
        return new Promise((resolve, reject) => {
            rest.put(
                Routes.applicationGuildCommands(this.clientId, this.guildId),
                { body: commandsToRegister },
            )
                .then((_) => resolve())
                .catch((err) => {
                    reject(err);
                });
        });
    }

    private sendMessage(content: string, channelId: string, userId: string) {
        if (channelId) {
            this.getChannel(channelId).then((channel: TextChannel) =>
                channel.send({ content }),
            );
        }
        if (userId) {
            this.getUser(userId)
                .then((user: User) => {
                    user.send({ content });
                })
                .catch((err) => {
                    this.loggingService.LogError(
                        `Error on fetching user with id ${userId}: \n ${err}`,
                    );
                });
        }
    }

    private getChannel(channelId: string): Promise<Channel> {
        const channel = this.client.channels.cache.get(channelId);
        if (channel) {
            return Promise.resolve(channel);
        } else {
            return this.client.channels.fetch(channelId);
        }
    }

    private getUser(userId: string): Promise<User> {
        const user = this.client.users.cache.get(userId);
        if (user) {
            return Promise.resolve(user);
        } else {
            return this.client.users.fetch(userId);
        }
    }

    private playSoundToUser(
        userId: string,
        filePath: string,
        url: string,
    ): void {
        this.client.guilds.fetch(this.guildId).then((guild) => {
            guild.members.fetch(userId).then((member) => {
                const channelId = member.voice.channel.id;
                this.stopChannelSound(channelId);
                const connection = joinVoiceChannel({
                    guildId: this.guildId,
                    channelId: channelId,
                    adapterCreator: guild.voiceAdapterCreator,
                    selfMute: false,
                    selfDeaf: false,
                });

                let resource;
                if (url && url.length > 0) {
                    // resource = createAudioResource(ytdl(url))
                    const stream = new FFmpeg({
                        args: [
                            "-reconnect_streamed",
                            "1",
                            "-reconnect_at_eof",
                            "1",
                            "-reconnect_on_network_error",
                            "1",
                            "-reconnect_on_http_error",
                            "1",
                            "-reconnect_delay_max",
                            "5",
                            "-i",
                            "your url here",
                            ...FFMPEG_OPUS_ARGUMENTS,
                        ],
                    });

                    const resource = createAudioResource(stream, {
                        inputType: StreamType.OggOpus,
                    });
                } else {
                    filePath = require("path").join(
                        __dirname,
                        "..",
                        "..",
                        filePath,
                    );
                    resource = createAudioResource(filePath);
                }
                const player = createAudioPlayer();
                player.on("stateChange", (oldState, newState) => {
                    console.log(newState.status);
                    if (
                        oldState.status == AudioPlayerStatus.Playing &&
                        newState.status == AudioPlayerStatus.Idle
                    ) {
                        this.stopChannelSound(channelId);
                    }
                });
                this.playerMap.set(channelId, {
                    player,
                    voiceChat: connection,
                });
                connection.subscribe(player);
                player.play(resource);
            });
        });
    }

    private stopSoundToUser(userId: string): void {
        this.client.guilds.fetch(this.guildId).then((guild) => {
            guild.members
                .fetch(userId)
                .then((member) =>
                    this.stopChannelSound(member.voice.channel.id),
                );
        });
    }

    private stopChannelSound(channelId: string): void {
        if (!this.playerMap.has(channelId)) {
            return;
        }
        console.log("removeListener");
        const player = this.playerMap.get(channelId);
        player.player.removeAllListeners();
        player.voiceChat.destroy();
        this.playerMap.delete(channelId);
    }
}
