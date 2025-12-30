import { Message } from "discord.js";
import "mocha";
import "reflect-metadata";
import { instance, mock, reset, verify } from "ts-mockito";
import { MappedResponder } from "../src/message-handler/mapped-responder/mapped-responder";

describe("MappedResponder", () => {
    const mappedResponder = new MappedResponder();
    mappedResponder.setup("ping!", "pong!");

    const mockedMessage = mock(Message);
    const mockedMessageInstance = instance(mockedMessage);

    beforeEach(() => {
        reset(mockedMessage);
    });

    it("should reply", () => {
        mockedMessageInstance.content = "ping!";
        mappedResponder.Handle(mockedMessageInstance);
        verify(mockedMessage.reply("pong!")).once();
    });

    it("should not reply", () => {
        mockedMessageInstance.content = "asdf!";
        mappedResponder.Handle(mockedMessageInstance);
        verify(mockedMessage.reply("pong!")).never();
    });
});
