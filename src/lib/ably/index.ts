import * as Ably from 'ably';
import dotenv from "dotenv";
import notifyDiscordSale from 'lib/discord/notifyDiscordSale';
import logger from 'lib/logger';

const result = dotenv.config();

const options: Ably.Types.ClientOptions = { key: process.env.ABLY_TOKEN };
const client = new Ably.Realtime(options);

export default function startAblyFeedFor(
  projectChannel: string,
  discordChannelId: string
) {
  let channel = client.channels.get(projectChannel);

  client.connection.on('connected', function() {
    logger.log(`Successful connect: ${projectChannel}`);
  });

  channel.subscribe('LISTING', function(message) {
    notifyDiscordSale(discordChannelId, message.data);
  });
}