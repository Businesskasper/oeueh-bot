import "reflect-metadata";
import 'mocha';
import { anything, instance, mock, reset, verify, when } from "ts-mockito";
import container from "../src/inversify.config";
import { TYPES } from "../src/types";
import { LoggingService } from "../src/logging.service";
import { MessageBroker } from "../src/message-broker";
import { Client } from "discord.js";

describe('LoggingService -> MessageBroker integration', () => {
    container.rebind<(message: any) => void>(TYPES.Log)
        .toFunction(() => {});

    let clientMock: Client = mock(Client);;
    let clientInstance: Client= instance(clientMock);
    container.rebind<Client>(TYPES.Client)
        .toConstantValue(clientInstance);;

    let messageBrokerMock = mock(MessageBroker);
    let messageBrokerInstance = instance(messageBrokerMock);
    container.rebind<MessageBroker>(TYPES.MessageBroker)
        .toConstantValue(messageBrokerInstance);

    let logger = container.get<LoggingService>(TYPES.LoggingService);
    let logMessage = 'ping!';

    beforeEach(() => {
        reset(clientMock);
        reset(messageBrokerMock);
    });

    it('Logging to discord should notify the message broker', () => {
        logger.LogMessage(logMessage, true);
        verify(messageBrokerMock.dispatchSendMessage(anything())).once();        
    });

    it('Logging to console only should not notify the message broker', () => {
        logger.LogMessage(logMessage, false);
        verify(messageBrokerMock.dispatchSendMessage(anything())).never();
    });
}) 
    

