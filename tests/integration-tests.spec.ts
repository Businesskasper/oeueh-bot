import "reflect-metadata";
import 'mocha';
import { instance, mock, spy, verify, when } from "ts-mockito";
import { Client, Message } from "discord.js";
import { Bot } from '../src/bot';
import container from "../src/inversify.config";
import { TYPES } from "../src/types";
import { MessageBroker } from "../src/message-broker";
import { expect } from "chai";


describe('Bot', () => {
    let clientMock: Client;
    let clientInstance: Client;
    let client: Client;
    let bot: Bot;

    let messageBrokerInstance: MessageBroker;
    let messageBrokerMock: MessageBroker;

    let messageMock: Message;
    let messageInstance: Message;

    beforeEach(() => {
        clientMock = mock(Client);
        clientInstance = instance(clientMock);
        container.rebind<Client>(TYPES.Client)
            .toConstantValue(clientInstance);

        messageBrokerMock = mock(MessageBroker)
        messageBrokerInstance = instance(messageBrokerMock);
        container.rebind<MessageBroker>(TYPES.MessageBroker)
            .toConstantValue(messageBrokerInstance);

        client = container.get<Client>(TYPES.Client);
    });

    // Test cases here
    it('Should dispatch SendMessage', () => {   
        messageMock = mock(Message);
        messageInstance = instance(messageMock);
        messageInstance.content = 'ping!';
        client.emit('message', messageInstance);

        
        verify(messageBrokerMock.dispatchMessageReceived(messageInstance)).once();
    })
});