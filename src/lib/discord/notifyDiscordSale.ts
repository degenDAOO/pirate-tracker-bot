import { Env, loadConfig } from "config";
import dotenv from "dotenv";
import { MessageActionRow, MessageEmbed } from "discord.js";

import logger from "lib/logger";
import { fetchDiscordChannel, initClient } from "./index";
import truncateForAddress from "lib/truncateForAddress";

const result = dotenv.config();
const config = loadConfig(process.env as Env);

const status: {
  totalNotified: number;
  lastNotified?: Date;
} = {
  totalNotified: 0,
};

export function getStatus() {
  return status;
}

export default async function notifyDiscordSale(
  channelId: string,
  message: string,
  test?: boolean
) {  

  let client = await initClient(config.discordBotToken);
  const channel = await fetchDiscordChannel(client, channelId);
  if (!channel) {
    return;
  }
  const data = JSON.parse(message);

	const attributes = data.item.attributes;
	const fields = [
		{
			name: 'Price',
			value: `${data.item.market_place_state.price} SOL`,
			inline: true
		},
    {
      name: 'Rank est.',
      value: `${data.item?.rank_est}`,
      inline: true
    },
    {
      name: 'Seller',
      value: truncateForAddress(data.item.market_place_state.seller_address as string),
      inline: true
    },
		{
			name: '\u200B',
			value: '---',
			inline: false
		}
	];

	Object.keys(attributes).forEach(function (key) {
		if (key != 'generation') {
			let $trait = {
				name: key,
				value: attributes[key] ?? 'n/a',
				inline: true
			};
			fields.push($trait);
		}
	});
	
	fields.push(
		{
			name: '---',
			value: '\u200B',
			inline: false
		}
	);

	const actionRowMsg = new MessageActionRow({
    type: 1,
    components: [
      {
        style: 5,
        label: `Buy on Hyperspace`,
        url: `https://hyperspace.xyz/token/${data.token_address}`,
        disabled: false,
				emoji: {
					id: null,
					name: `🚀`
				},
        type: 2,
      }
    ]
  });

  const embedMsg = new MessageEmbed({
    color: 0x202220,
    title: data.item.name,
		description: '\u200B',
    url: `https://hyperspace.xyz/token/${data.token_address}`,
    thumbnail: {
      url: encodeURI(data.item.meta_data_img),
      width: 128,
      height: 128,
    },
		fields: fields,
		author: {
			name: `NEW ${data.action_type}`
		},
    footer: {
      text: 'Data provided by Hyperspace  |  🤖 by JSB',
      icon_url: 'https://hyperspace.xyz/favicon-32x32.png'
    },
  });

  await channel.send({
    components: [actionRowMsg],
    embeds: [embedMsg],
  });

  
  const logMsg = `Notified discord #${channel.name}: ${data.item.name} - ${data.action_type}`;
  logger.log(logMsg);

  if (!test) {
    status.lastNotified = new Date();
    status.totalNotified++;
  }
}
