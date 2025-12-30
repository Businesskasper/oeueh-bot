require("dotenv").config();
import { Bot } from "./bot";
import container from "./inversify.config";
import { LoggingService } from "./logging.service";
import { MessageHandlerService } from "./message-handler/message-handler.service";
import { ScheduledMessengerService } from "./scheduler/scheduled-messenger.service";
import { SlashCommandService } from "./slash-commands/slash-command.service";
import { TYPES } from "./types";

// Register handlers and scheduled messages
const messageHandlerService = container.get<MessageHandlerService>(
    TYPES.MessageHandlerService,
);
messageHandlerService.registerResponder();
const scheduledMessengerService = container.get<ScheduledMessengerService>(
    TYPES.ScheduledMessengerService,
);
scheduledMessengerService.registerScheduler();
const slashCommandService = container.get<SlashCommandService>(
    TYPES.SlashCommandService,
);
slashCommandService.registerCommands();

// Setup Bot for discord interaction
const logger = container.get<LoggingService>(TYPES.LoggingService);
const bot = container.get<Bot>(TYPES.Bot);
bot.setup()
    .then((_) => logger.LogMessage("Bot successfully started!", false))
    .catch((error) => logger.LogError(error, false));

// const onTerminate = () => {
//   // logger.LogWarning('Bot is shutting down!');
// }
// ['SIGHUP', 'SIGTERM', 'SIGINT'].forEach(ev => process.on(ev, onTerminate));
