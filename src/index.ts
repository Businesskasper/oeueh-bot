require('dotenv').config();
import { Bot } from './bot';
import container from './inversify.config';
import { TYPES } from './types';

let bot = container.get<Bot>(TYPES.Bot);

// test
bot
  .listen()
  .then((_) => console.log('Logged in!'))
  .catch((error) => console.error(error));
