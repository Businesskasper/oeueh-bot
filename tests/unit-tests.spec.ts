import 'reflect-metadata';
import 'mocha';
import { Message } from 'discord.js';
import { instance, mock, verify, when } from 'ts-mockito';
import { MappedResponder } from '../src/message-handler/mapped-responder/mapped-responder';

describe('MappedResponder', () => {
  let mappedResponder: MappedResponder;
  let mockedMessageClass: Message;
  let mockedMessageInstance: Message;

  beforeEach(() => {
    mappedResponder = new MappedResponder();
    mappedResponder.setup('ping!', 'pong!')
  });

  it('should reply', async () => {
    mockedMessageClass = mock(Message);
    mockedMessageInstance = instance(mockedMessageClass);
    mockedMessageInstance.content = 'ping!';

    mappedResponder.Handle(mockedMessageInstance);
    verify(mockedMessageClass.reply('pong!')).once();
  });

  it('should not reply', async () => {
    mockedMessageClass = mock(Message);
    mockedMessageInstance = instance(mockedMessageClass);
    mockedMessageInstance.content = 'asdf!';

    mappedResponder.Handle(mockedMessageInstance);
    verify(mockedMessageClass.reply('pong!')).never();
  });
});