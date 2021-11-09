import 'reflect-metadata';
import { Container } from 'inversify';
import { Client, Intents } from 'discord.js';
import { Bot } from './bot';
import { TYPES } from './types';
import { ResponseMap } from './message-handler/mapped-responder/response-map';
import { MappedResponder } from './message-handler/mapped-responder/mapped-responder';
import { MessageBroker } from './message-broker';
import { MessageHandlerService } from './message-handler/message-handler.service';
import { StretchScheduledMessenger } from './scheduler/stretch-scheduled-messenger';
import { ScheduledMessengerService } from './scheduler/scheduled-messenger.service';
import { appSettings, AppSettings } from './app-settings';
import { LoggingService } from './logging.service';
import { SlashCommandService } from './slash-commands/slash-command.service';
import { ReminderCommand } from './slash-commands/commands/reminder-command';
import { BotRepository } from './db/bot-repository';
import { DbService } from './db/db-service';
import { SoundCommand } from './slash-commands/commands/sound-command';

let container = new Container();

container.
  bind<(message: any) => void>(TYPES.Log)
  .toFunction(console.log);
container
  .bind<Bot>(TYPES.Bot)
  .to(Bot)
  .inSingletonScope();
container
  .bind<Client>(TYPES.Client)
  .toConstantValue(new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] }));
container
  .bind<MappedResponder>(TYPES.MappedResponder)
  .to(MappedResponder)
  .inRequestScope();
container
  .bind<string>(TYPES.Token)
  .toConstantValue(process.env.TOKEN);
container
  .bind<string>(TYPES.ClientId)
  .toConstantValue(process.env.CLIENTID);
container
  .bind<string>(TYPES.GuildId)
  .toConstantValue(process.env.GUILDID);
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
container
  .bind<AppSettings>(TYPES.AppSettings)
  .toConstantValue(appSettings);
container
  .bind<LoggingService>(TYPES.LoggingService)
  .to(LoggingService)
  .inSingletonScope();
container
  .bind<SlashCommandService>(TYPES.SlashCommandService)
  .to(SlashCommandService)
  .inSingletonScope();
container
  .bind<ReminderCommand>(TYPES.ReminderCommand)
  .to(ReminderCommand)
  .inSingletonScope();
container
  .bind<BotRepository>(TYPES.BotRepository)
  .to(BotRepository)
  .inSingletonScope();
container
  .bind<DbService>(TYPES.DbService)
  .toConstantValue(new DbService('./bot.db').InitializeDatabase('./schema.txt'));
container
  .bind<SoundCommand>(TYPES.SoundCommand)
  .to(SoundCommand)
  .inSingletonScope();


export default container;
