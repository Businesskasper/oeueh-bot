require('dotenv').config();
import { Bot } from './bot';
import container from './inversify.config';
import { TYPES } from './types';
import * as chalk from 'chalk';

let bot = container.get<Bot>(TYPES.Bot);

bot
  .setup()
  .then(_ => console.log(chalk.green.bold(`Bot successfully started!`)))
  .catch(error => console.error(chalk.red.bold(error)));
