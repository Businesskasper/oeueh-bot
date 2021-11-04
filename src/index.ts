require('dotenv').config();
import { Bot } from './bot';
import container from './inversify.config';
import { TYPES } from './types';
import { MessageHandlerService } from './message-handler/message-handler.service';
import { ScheduledMessengerService } from './scheduler/scheduled-messenger.service';
import { LoggingService } from './logging.service';

// Register handlers and scheduled messages
let messageHandlerService = container.get<MessageHandlerService>(TYPES.MessageHandlerService);
messageHandlerService.registerResponder();
let scheduledMessengerService = container.get<ScheduledMessengerService>(TYPES.ScheduledMessengerService);    
scheduledMessengerService.registerScheduler();

// Setup Bot for discord interaction
let logger = container.get<LoggingService>(TYPES.LoggingService);
let bot = container.get<Bot>(TYPES.Bot);
bot
  .setup()
  .then(_ => logger.LogMessage('Bot successfully started!'))
  .catch(error => logger.LogError(error, false));

// const onTerminate = () => {
//   // logger.LogWarning('Bot is shutting down!');
// }
// ['SIGHUP', 'SIGTERM', 'SIGINT'].forEach(ev => process.on(ev, onTerminate));
