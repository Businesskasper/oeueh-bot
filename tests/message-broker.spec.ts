import { expect } from "chai";
import { Message } from "discord.js";
import "mocha";
import "reflect-metadata";
import { instance, mock } from "ts-mockito";
import { MessageBroker } from "../src/message-broker";
import { SendMessageModel } from "../src/models/send-message.model";

describe("MessageBroker", () => {
    const messageBroker: MessageBroker = new MessageBroker();
    const mockedMessageClass = mock(Message);
    const mockedMessageInstance = instance(mockedMessageClass);
    mockedMessageInstance.content = "ping!";

    let sentMessage: SendMessageModel;
    let receivedMessage: Message;

    messageBroker.onMessageReceived$.subscribe(
        (message: any) => (receivedMessage = message),
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
        expect(receivedMessage.content).to.equal("ping!");
    });

    it("should send message", () => {
        expect(sentMessage.messageText).to.equal("pong!");
    });
});
