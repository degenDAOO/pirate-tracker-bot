import * as Ably from 'ably';
import { Env, loadConfig } from 'config';
import notifyDiscord from 'lib/discord/notifyDiscordSale';
import logger from 'lib/logger';
import notifyTwitter from 'lib/twitter/notifyTwitter';

const config = loadConfig(process.env as Env);
const { ablyToken } = config;
const options: Ably.Types.ClientOptions = { key: ablyToken };
const client = new Ably.Realtime(options);

const actionTypesToWatch = ['LISTING', 'TRANSACTION'];
const traitsToWatch = { 
  key: 'HEAD', 
  value: 'Pirate Hat', 
};

export default function startAblyFeedFor(
  projectChannel: string,
  discordChannelId: string
) {
  let channel = client.channels.get(projectChannel);

  client.connection.on('connected', function() {
    logger.log(`Successful connect: ${projectChannel}`);
  });

  channel.subscribe(function(message) {
    let data = JSON.parse(message.data);
    let actionType = data.action_type;
    let attributes = data.item.attributes;

    if (actionTypesToWatch.includes(actionType) && attributes[traitsToWatch.key] == traitsToWatch.value) {
      notifyDiscord(discordChannelId, actionType, message.data);
    }

    // notifyTwitter(message.data);
    
  });
}