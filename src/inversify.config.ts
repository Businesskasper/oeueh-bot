import { Client } from "discord.js";
import { Container } from "inversify";
import "reflect-metadata";
import { appSettings, AppSettings } from "./app-settings";
import { Bot } from "./bot";
import { LoggingService } from "./logging.service";
import { MessageBroker } from "./message-broker";
import { MappedResponder } from "./message-handler/mapped-responder/mapped-responder";
import { ResponseMap } from "./message-handler/mapped-responder/response-map";
import { MessageHandlerService } from "./message-handler/message-handler.service";
import { ScheduledMessengerService } from "./scheduler/scheduled-messenger.service";
import { StretchScheduledMessenger } from "./scheduler/stretch-scheduled-messenger";
import { TYPES } from "./types";

const container = new Container();

container.bind<(message: any) => void>(TYPES.Log).toFunction(console.log);
container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());
container
    .bind<MappedResponder>(TYPES.MappedResponder)
    .to(MappedResponder)
    .inRequestScope();
container.bind<string>(TYPES.Token).toConstantValue(process.env.TOKEN);
container
    .bind<Map<string, string | string[]>>(TYPES.ResponseMap)
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
container.bind<AppSettings>(TYPES.AppSettings).toConstantValue(appSettings);
container
    .bind<LoggingService>(TYPES.LoggingService)
    .to(LoggingService)
    .inSingletonScope();

export default container;
