import { Message } from 'discord.js';
import { inject, injectable } from 'inversify';

import { TYPES } from '../types';

import { PingFinder } from './ping-finder';
import { PenisFinder } from './penis-finder';
import { AgentFinder } from './agent-finder';
import { TodoFinder } from './todo-finder';

import { todos } from '../data/todos';
import { agents } from '../data/agents';
import { shuffleArray } from '../utils/utils';

@injectable()
export class MessageResponder {
  private pingFinder: PingFinder;
  private penisFinder: PenisFinder;
  private agentFinder: AgentFinder;
  private todoFinder: TodoFinder;

  constructor(
    @inject(TYPES.PingFinder) pingFinder: PingFinder,
    @inject(TYPES.PenisFinder) penisFinder: PenisFinder,
    @inject(TYPES.AgentFinder) agentFinder: AgentFinder,
    @inject(TYPES.TodoFinder) todoFinder: TodoFinder
  ) {
    this.pingFinder = pingFinder;
    this.penisFinder = penisFinder;
    this.agentFinder = agentFinder;
    this.todoFinder = todoFinder;
  }

  handle(message: Message): Promise<Message | Message[]> {
    if (this.pingFinder.isPing(message.content)) {
      return message.reply('pong!');
    } else if (this.penisFinder.isPenis(message.content)) {
      return message.reply('fotze');
    } else if (this.agentFinder.isAgent(message.content)) {
      return message.reply(`du spielst ${shuffleArray<string>(agents)}!`);
    } else if (this.todoFinder.isTodo(message.content)) {
      return message.reply(shuffleArray<string>(todos));
    }
    return Promise.reject();
  }
}
