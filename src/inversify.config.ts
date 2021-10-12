import "reflect-metadata";
import { Container } from "inversify";
import { Client } from "discord.js";
import { Bot } from "./bot";
import { TYPES } from "./types";
import { ResponseMap } from "./message-handler/mapped-responder/response-map";
import { MappedResponder } from "./message-handler/mapped-responder/mapped-responder";
import { ValorantAgentResponder } from "./message-handler/valorant-agent-responder/valorant-agent-responder";
import { TodoResponder } from "./message-handler/todo-responder/todo-responder";
import { MessageBroker } from "./message-broker";
import { MessageHandlerService } from "./message-handler/message-handler-service";
import { StretchScheduledMessenger } from "./scheduler/stretch-scheduled-messenger";
import { ScheduledMessengerService } from "./scheduler/scheduled-messenger-service";
import { TwitchScheduledMessenger } from "./scheduler/twitch-scheduled-messenger";

let container = new Container();

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());
container
    .bind<MappedResponder>(TYPES.MappedResponder)
    .to(MappedResponder)
    .inRequestScope();
container
    .bind<ValorantAgentResponder>(TYPES.ValorantAgentResponder)
    .to(ValorantAgentResponder)
    .inSingletonScope();
container
    .bind<TodoResponder>(TYPES.TodoResponder)
    .to(TodoResponder)
    .inSingletonScope();
container.bind<string>(TYPES.Token).toConstantValue(process.env.TOKEN);
container
    .bind<Map<string, string>>(TYPES.ResponseMap)
    .toConstantValue(ResponseMap);
container
    .bind<MessageBroker>(TYPES.MessageBroker)
    .to(MessageBroker)
    .inSingletonScope();
container
    .bind<MessageHandlerService>(TYPES.MessageHandlerService)
    .to(MessageHandlerService)
    .inSingletonScope();
container
    .bind<ScheduledMessengerService>(TYPES.ScheduledMessengerService)
    .to(ScheduledMessengerService)
    .inSingletonScope();
container
    .bind<StretchScheduledMessenger>(TYPES.StretchScheduledMessenger)
    .to(StretchScheduledMessenger)
    .inSingletonScope();
container
    .bind<TwitchScheduledMessenger>(TYPES.TwitchScheduledMessenger)
    .to(TwitchScheduledMessenger)
    .inSingletonScope();

export default container;
