import 'reflect-metadata';
import { Container } from 'inversify';
import { Client } from 'discord.js';

import { MessageResponder } from './services/message-responder';
import { PingFinder } from './services/ping-finder';
import { PenisFinder } from './services/penis-finder';
import { AgentFinder } from './services/agent-finder';
import { TodoFinder } from './services/todo-finder';

import { Bot } from './bot';
import { TYPES } from './types';

let container = new Container();

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());
container.bind<string>(TYPES.Token).toConstantValue(process.env.TOKEN);
container
  .bind<MessageResponder>(TYPES.MessageResponder)
  .to(MessageResponder)
  .inSingletonScope();
container.bind<PingFinder>(TYPES.PingFinder).to(PingFinder).inSingletonScope();
container
  .bind<PenisFinder>(TYPES.PenisFinder)
  .to(PenisFinder)
  .inSingletonScope();
container
  .bind<AgentFinder>(TYPES.AgentFinder)
  .to(AgentFinder)
  .inSingletonScope();

container.bind<TodoFinder>(TYPES.TodoFinder).to(TodoFinder).inSingletonScope();

export default container;
