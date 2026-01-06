import { Client } from "discord.js";
import "mocha";
import "reflect-metadata";
import { instance, mock, reset, verify } from "ts-mockito";
import { AppSettings } from "../src/app-settings";
import { Bot } from "../src/bot";
import container from "../src/inversify.config";
import { TYPES } from "../src/types";

describe("Bot -> Client integration", () => {
    const fakeToken = "token";
    container.rebind<AppSettings>(TYPES.AppSettings).toConstantValue({
        Token: fakeToken,
        ClientId: "id",
        GuildId: "gid",
        LogChannelId: "logid",
        MessageChannelId: "msgid",
    });

    const clientMock = mock(Client);
    const clientInstance = instance(clientMock);
    container.rebind<Client>(TYPES.Client).toConstantValue(clientInstance);

    const bot = container.get<Bot>(TYPES.Bot);

    beforeEach(() => {
        reset(clientMock);
    });

    it("Setup should try login client with injected token", async () => {
        await bot.setup();
        verify(clientMock.login(fakeToken)).once();
    });
});
