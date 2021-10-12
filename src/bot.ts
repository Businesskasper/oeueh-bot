import { Client, Message, TextChannel } from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "./types";
import { MessageResponder } from "./services/message-responder";
import * as cron from "node-cron";
import * as chalk from "chalk";

const log = console.log;

@injectable()
export class Bot {
    private client: Client;
    private readonly token: string;
    private messageResponder: MessageResponder;
    private channelID: string = "897218467596468244"; // öüh-bot channel. NOTE: channel must be textchannel to work properly!

    constructor(
        @inject(TYPES.Client) client: Client,
        @inject(TYPES.Token) token: string,
        @inject(TYPES.MessageResponder) messageResponder: MessageResponder
    ) {
        this.messageResponder = messageResponder;
        this.token = token;
        this.client = client;
    }

    public listen(): Promise<string> {
        this.client.on("message", (message: Message) => {
            if (message.author.bot) {
                console.log(chalk.red("Ignoring bot message!"));
                return;
            }

            log("*************");
            log(
                "Message received! Contents: ",
                chalk.bgGray.bold(message.content)
            );
            log("*************");

            this.messageResponder
                .handle(message)
                .then(() => {
                    log(chalk.green.bold("Response sent!"));
                })
                .catch(() => {
                    log(chalk.red.bold("Response sent!"));
                });
        });

        // runs every hour
        cron.schedule("0 * * * *", async () => {
            try {
                //console.log(this.client.channels) if you want to get the channel ids;
                // Note: channel must be TextChannel to work properly
                const channel: TextChannel = this.client.channels.cache.get(
                    this.channelID
                ) as TextChannel;

                await channel.send("It's Streching time!");

                log(
                    chalk.bgGreen.bold(
                        `Reminder sent to channel: ${channel.name}`
                    )
                );
            } catch (error) {
                log(chalk.red.bold(error));
            }
        });

        return this.client.login(this.token);
    }
}
