import { Client } from "discord.js";
import "mocha";
import "reflect-metadata";
import { instance, mock, reset, verify, when } from "ts-mockito";
import { Bot } from "../src/bot";
import container from "../src/inversify.config";
import { TYPES } from "../src/types";

describe("Bot -> Client integration", () => {
    const fakeToken = "token";
    container.rebind<string>(TYPES.Token).toConstantValue(fakeToken);

    const clientMock = mock(Client);
    const clientInstance = instance(clientMock);
    container.rebind<Client>(TYPES.Client).toConstantValue(clientInstance);

    const bot = container.get<Bot>(TYPES.Bot);

    beforeEach(() => {
        reset(clientMock);
    });

    it("Setup should try login client with injected token", async () => {
        // Mock the login method to return a resolved promise with the token
        when(clientMock.login(fakeToken)).thenResolve(fakeToken);

        await bot.setup();
        verify(clientMock.login(fakeToken)).once();
    });
});
