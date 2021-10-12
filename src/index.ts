require('dotenv').config();
import { Bot } from './bot';
import container from './inversify.config';
import { TYPES } from './types';
import * as chalk from 'chalk';
import { MessageHandlerService } from './message-handler/message-handler-service';
import { ScheduledMessengerService } from './scheduler/scheduled-messenger-service';

// Register handlers and scheduled messages
let messageHandlerService = container.get<MessageHandlerService>(TYPES.MessageHandlerService);
messageHandlerService.registerResponder();
let scheduledMessengerService = container.get<ScheduledMessengerService>(TYPES.ScheduledMessengerService);    
scheduledMessengerService.registerScheduler();

// Setup Bot for discord interaction
let bot = container.get<Bot>(TYPES.Bot);
bot
  .setup()
  .then(_ => console.log(chalk.green.bold(`Bot successfully started!`)))
  .catch(error => console.error(chalk.red.bold(error)));
