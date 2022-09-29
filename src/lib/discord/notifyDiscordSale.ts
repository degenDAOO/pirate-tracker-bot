import { Env, loadConfig } from "config";
import { MessageActionRow, MessageEmbed } from "discord.js";
import logger from "lib/logger";
import { fetchDiscordChannel, initClient } from "./index";
import { getMessage } from "./types";

const config = loadConfig(process.env as Env);
const { discordBotToken } = config;

const status: {
  totalNotified: number;
  lastNotified?: Date;
} = {
  totalNotified: 0,
};

export function getStatus() {
  return status;
}

export default async function notifyDiscord(
  channelId: string,
  actionType: string,
  message: string,
) {  

  const data = JSON.parse(message);

  let { actionRowMsg, embedMsg } = getMessage(actionType.toLowerCase(), message);

  await pushToDiscord(channelId, actionRowMsg, embedMsg);

  const logMsg = `Notified discord #${channelId}: ${data.item.name} - ${data.action_type}`;
  logger.log(logMsg);

  status.lastNotified = new Date();
  status.totalNotified++;

}


async function pushToDiscord(
  channelId: string, 
  actionRowMsg: MessageActionRow, 
  embedMsg: MessageEmbed
) {

  let client = await initClient(discordBotToken);
  const channel = await fetchDiscordChannel(client, channelId);
  if (!channel) {
    return;
  }

  await channel.send({
    components: [actionRowMsg],
    embeds: [embedMsg],
  });
  
}

