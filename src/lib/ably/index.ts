import * as Ably from 'ably';
import { Env, loadConfig } from 'config';
import notifyDiscordSale from 'lib/discord/notifyDiscordSale';
import logger from 'lib/logger';
import notifyTwitter from 'lib/twitter/notifyTwitter';

const config = loadConfig(process.env as Env);
const { bannedTokens, ablyToken } = config;
const options: Ably.Types.ClientOptions = { key: ablyToken };
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
    let data = JSON.parse(message.data);

    if (! bannedTokens.includes(data.token_address)) {
      notifyDiscordSale(discordChannelId, message.data);
      notifyTwitter(message.data);
    } else {
      logger.log(`Banned Token Blocked: ${data.item.name}`);
    }
  });
}