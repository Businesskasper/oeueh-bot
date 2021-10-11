import "reflect-metadata";
import 'mocha';
import { instance, mock, verify, when } from "ts-mockito";
import { Client } from "discord.js";
import { Bot } from '../src/bot';
import container from "../src/inversify.config";
import { TYPES } from "../src/types";


describe('Bot', () => {
    let discordMock: Client;
    let discordInstance: Client;
    let bot: Bot;

    beforeEach(() => {
        discordMock = mock(Client);
        discordInstance = instance(discordMock);
        container.rebind<Client>(TYPES.Client)
            .toConstantValue(discordInstance);
        bot = container.get<Bot>(TYPES.Bot);
    });

    // Test cases here

});