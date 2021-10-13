import 'reflect-metadata';
import 'mocha';
import { Message } from 'discord.js';
import { instance, mock, verify, when } from 'ts-mockito';
import { MappedResponder } from '../src/message-handler/mapped-responder/mapped-responder';
import { MessageBroker } from '../src/message-broker';
import { expect } from 'chai';
import { SendMessageModel } from '../src/models/send-message.model';

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

describe('MessageBroker', () => {  
  let messageBroker: MessageBroker = new MessageBroker();
  let mockedMessageClass = mock(Message);
  let mockedMessageInstance = instance(mockedMessageClass);
  mockedMessageInstance.content = 'ping!';

  let mockedReceivedMessageClass = mock(Message);
  let mockedReceivedMessageInstance = instance(mockedReceivedMessageClass);

  let sentMessage: SendMessageModel;

  messageBroker.onMessageReceived$.subscribe((message: Message) => mockedReceivedMessageInstance = message)

  messageBroker.onSendMessage$.subscribe((messageContent: SendMessageModel) => sentMessage = messageContent);

  before(() => {
    messageBroker.dispatchMessageReceived(mockedMessageInstance);
    messageBroker.dispatchSendMessage({messageText: 'pong!', channelId: ''})
  })

  it('should receive message', () => {
    expect(mockedReceivedMessageInstance.content === 'ping!').to.be.true;
  });

  it('should send message', () => {
    expect(sentMessage.messageText === 'pong!').to.be.true;
  });
});
