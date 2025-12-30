export interface AppSettings {
    LogChannelId: string;
    MessageChannelId: string;
}

export const appSettings: AppSettings = {
    LogChannelId: process.env.LOG_CHANNEL_ID || "",
    MessageChannelId: process.env.MESSAGE_CHANNEL_ID || "",
};
