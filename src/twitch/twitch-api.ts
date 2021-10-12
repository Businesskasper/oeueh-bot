import { Message } from "discord.js";
import { inject, injectable } from "inversify";
import axios from "axios";

import { TYPES } from "../types";

@injectable()
export class TwitchAPI {
    private clientId: string;
    private clientSecret: string;
    constructor(clientId: string, clientSecret: string) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    async getAccessToken(): Promise<string> {
        try {
            let token: any = await axios.post(
                `https://id.twitch.tv/oauth2/token?client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials`
            );
            return token.data.access_token;
        } catch (error) {
            console.log(error);
        }
    }

    async getLiveStreams(accessToken: string, streamerIds: string[]) {
        if (streamerIds.length >= 100) {
            console.log("You can only search for a limit of 100 streamers");
            return "You can only search for a limit of 100 streamers";
        }

        let queryString = this.buildQueryString(streamerIds);

        try {
            let config = {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Client-Id": this.clientId,
                },
            };

            // limit search 100 streams
            let streams: any = await axios.get(
                `https://api.twitch.tv/helix/streams?${queryString}`,
                config
            );

            console.log(streams);

            let listOfLiveStreams = [];
            for (let s in streamerIds) {
                for (let p in streams.data.data) {
                    if (streams.data.data[p].user_id === streamerIds[s]) {
                        let obj = {
                            user_id: streamerIds[s],
                            is_live: true,
                            user_data: streams.data.data[s],
                        };
                        listOfLiveStreams.push(obj);
                    } else {
                        let obj = {
                            user_id: streamerIds[s],
                            is_live: false,
                        };
                        listOfLiveStreams.push(obj);
                    }
                }
            }

            return listOfLiveStreams;
        } catch (error) {
            console.log(error);
        }
    }

    buildQueryString(arr: string[]): string {
        let outputArry: string[] = [];
        for (let s in arr) {
            outputArry.push(`user_id=${s}`);
        }
        return outputArry.join("&");
    }
}

/*
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

        let twitch = new TwitchAPI(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET
        );
        let token = "";
        twitch.getAccessToken().then((res) => (token = res));

        console.log(token);

        cron.schedule("* * * * *", async () => {
            try {
                let streams = await twitch.getLiveStreams(token, [
                    "39043515",
                    "190835892",
                    "35630634",
                ]);
                log(streams);
                return streams;
            } catch (error) {
                log(chalk.red.bold(error));
            }
        });
        */
