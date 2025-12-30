import { Client } from "discord.js";
import "mocha";
import "reflect-metadata";
import { anything, instance, mock, reset, verify } from "ts-mockito";
import container from "../src/inversify.config";
import { LoggingService } from "../src/logging.service";
import { MessageBroker } from "../src/message-broker";
import { TYPES } from "../src/types";

describe("LoggingService -> MessageBroker integration", () => {
    container.rebind<(message: any) => void>(TYPES.Log).toFunction(() => {});

    const clientMock: Client = mock(Client);
    const clientInstance: Client = instance(clientMock);
    container.rebind<Client>(TYPES.Client).toConstantValue(clientInstance);

    const messageBrokerMock = mock(MessageBroker);
    const messageBrokerInstance = instance(messageBrokerMock);
    container
        .rebind<MessageBroker>(TYPES.MessageBroker)
        .toConstantValue(messageBrokerInstance);

    const logger = container.get<LoggingService>(TYPES.LoggingService);
    const logMessage = "ping!";

    beforeEach(() => {
        reset(clientMock);
        reset(messageBrokerMock);
    });

    it("Logging to discord should notify the message broker", () => {
        logger.LogMessage(logMessage, true);
        verify(messageBrokerMock.dispatchSendMessage(anything())).once();
    });

    it("Logging to console only should not notify the message broker", () => {
        logger.LogMessage(logMessage, false);
        verify(messageBrokerMock.dispatchSendMessage(anything())).never();
    });
});
