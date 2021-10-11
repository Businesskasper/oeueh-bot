import "reflect-metadata";
import 'mocha';
import {expect} from 'chai';
import {PingFinder} from "../src/services/ping-finder";
import {MessageResponder} from "../src/services/message-responder";
import {instance, mock, verify, when} from "ts-mockito";
import {Message} from "discord.js";
import { PenisFinder } from "../src/services/penis-finder";

describe('MessageResponder', () => {
  let mockedPingFinderClass: PingFinder;
  let mockedPingFinderInstance: PingFinder;
  let mockedMessageClass: Message;
  let mockedMessageInstance: Message;
  let mockedPenisFinderClass: any;
  let mockedPenisFinderInstance: any;

  let service: MessageResponder;

  beforeEach(() => {
    mockedPingFinderClass = mock(PingFinder);
    mockedPingFinderInstance = instance(mockedPingFinderClass);
    mockedPenisFinderClass = mock(PenisFinder);
    mockedPenisFinderInstance = instance(mockedMessageClass);

    mockedMessageClass = mock(Message);
    mockedMessageInstance = instance(mockedMessageClass);
    setMessageContents();

    service = new MessageResponder(mockedPingFinderInstance, mockedPenisFinderInstance);
  })

  it('should reply', async () => {
    whenIsPingThenReturn(true);

    await service.handle(mockedMessageInstance);

    verify(mockedMessageClass.reply('pong!')).once();
  })

  it('should not reply', async () => {
    whenIsPingThenReturn(false);

    await service.handle(mockedMessageInstance).then(() => {
      // Successful promise is unexpected, so we fail the test
      expect.fail('Unexpected promise');
    }).catch(() => {
	 // Rejected promise is expected, so nothing happens here
    });

    verify(mockedMessageClass.reply('pong!')).never();
  })

  function setMessageContents() {
    mockedMessageInstance.content = "Non-empty string";
  }

  function whenIsPingThenReturn(result: boolean) {
    when(mockedPingFinderClass.isPing("Non-empty string")).thenReturn(result);
  }
});


describe('PingFinder', () => {
    let service: PingFinder;
    beforeEach(() => {
      service = new PingFinder();
    })
  
    it('should find "ping" in the string', () => {
      expect(service.isPing("ping")).to.be.true
    })
  });