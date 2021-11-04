import 'reflect-metadata';
import 'mocha';
import { Message } from 'discord.js';
import { instance, mock, reset, verify, when } from 'ts-mockito';
import { MappedResponder } from '../src/message-handler/mapped-responder/mapped-responder';

describe('MappedResponder', () => {
  let mappedResponder = new MappedResponder();
  mappedResponder.setup('ping!', 'pong!')

  let mockedMessage = mock(Message);
  let mockedMessageInstance = instance(mockedMessage);

  beforeEach(() => {
    reset(mockedMessage);
  })

  it('should reply', () => {
    mockedMessageInstance.content = 'ping!';
    mappedResponder.Handle(mockedMessageInstance);
    verify(mockedMessage.reply('pong!')).once();
  });

  it('should not reply', () => {
    mockedMessageInstance.content = 'asdf!';
    mappedResponder.Handle(mockedMessageInstance);
    verify(mockedMessage.reply('pong!')).never();
  });
});