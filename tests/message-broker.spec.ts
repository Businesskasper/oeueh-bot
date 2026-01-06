import { expect } from "chai";
import { Message } from "discord.js";
import "mocha";
import "reflect-metadata";
import { filter } from "rxjs";
import { instance, mock } from "ts-mockito";
import { MessageBroker } from "../src/message-broker";
import { SendMessageModel } from "../src/models/send-message.model";

describe("MessageBroker", () => {
    const messageBroker: MessageBroker = new MessageBroker();
    const mockedMessageClass = mock(Message);
    const mockedMessageInstance = instance(mockedMessageClass);
    mockedMessageInstance.content = "ping!";

    const mockedReceivedMessageClass = mock(Message);
    let mockedReceivedMessageInstance = instance(mockedReceivedMessageClass);

    let sentMessage: SendMessageModel;

    messageBroker.onMessageReceived$
        .pipe(filter((message: unknown) => message instanceof Message))
        .subscribe(
            (message: Message) => (mockedReceivedMessageInstance = message),
        );
    messageBroker.onSendMessage$.subscribe(
        (messageContent: SendMessageModel) => (sentMessage = messageContent),
    );

    before(() => {
        messageBroker.dispatchMessageReceived(mockedMessageInstance);
        messageBroker.dispatchSendMessage({
            messageText: "pong!",
            channelId: "",
        });
    });

    it("should receive message", () => {
        expect(mockedReceivedMessageInstance.content === "ping!").to.be.true;
    });

    it("should send message", () => {
        expect(sentMessage.messageText === "pong!").to.be.true;
    });
});
