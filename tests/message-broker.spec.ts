import 'reflect-metadata';
import 'mocha';
import { Message } from 'discord.js';
import { instance, mock } from 'ts-mockito';
import { MessageBroker } from '../src/message-broker';
import { expect } from 'chai';
import { SendMessageModel } from '../src/models/send-message.model';
import { filter } from 'rxjs';

describe('MessageBroker', () => {  
  let messageBroker: MessageBroker = new MessageBroker();
  let mockedMessageClass = mock(Message);
  let mockedMessageInstance = instance(mockedMessageClass);
  mockedMessageInstance.content = 'ping!';

  let mockedReceivedMessageClass = mock(Message);
  let mockedReceivedMessageInstance = instance(mockedReceivedMessageClass);

  let sentMessage: SendMessageModel;

  messageBroker.onMessageReceived$
    .pipe(filter(message => message instanceof Message))
    .subscribe((message: Message) => mockedReceivedMessageInstance = message);
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
