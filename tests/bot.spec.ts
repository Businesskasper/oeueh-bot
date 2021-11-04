import "reflect-metadata";
import 'mocha';
import { instance, mock, reset, verify } from "ts-mockito";
import { Client, Message } from "discord.js";
import { Bot } from '../src/bot';
import container from "../src/inversify.config";
import { TYPES } from "../src/types";


describe('Bot -> Client integration', () => {
    let fakeToken = 'token';
    container.rebind<string>(TYPES.Token)
        .toConstantValue(fakeToken);

    let clientMock = mock(Client);
    let clientInstance = instance(clientMock);
    container.rebind<Client>(TYPES.Client)
        .toConstantValue(clientInstance);

    let bot = container.get<Bot>(TYPES.Bot);

    beforeEach(() => {
        reset(clientMock);
    });

    it ('Setup should try login client with injected token', async () => {
        await bot.setup();
        verify(clientMock.login(fakeToken)).once();
    });
});