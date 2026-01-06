export interface AppSettings {
    Token: string;
    ClientId: string;
    GuildId: string;
    LogChannelId: string;
    MessageChannelId: string;
}

export const appSettings: AppSettings = {
    Token: process.env.TOKEN || "",
    ClientId: process.env.CLIENTID || "",
    GuildId: process.env.GUILDID || "",
    LogChannelId: process.env.LOG_CHANNEL_ID || "",
    MessageChannelId: process.env.MESSAGE_CHANNEL_ID || "",
};
