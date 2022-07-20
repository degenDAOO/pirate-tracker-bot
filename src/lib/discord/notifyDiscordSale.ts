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
      name: 'Seller',
      value: `[${truncateForAddress(data.item.market_place_state.seller_address as string)}](https://hyperspace.xyz/account/${data.item.market_place_state.seller_address})`,
      inline: true
    }
	];
  
  if (data.item.project_id == 'degentrashpandas') {
    const traits = ['IDEA_CREDIT', 'EXALTED_STAT', '❤️'];
    traits.map(key => {
      let trait = {
            name: key,
            value: attributes[key],
            inline: true
          };
      fields.push(trait);
    });
    
    // Add in the divider between Price/Seller if we show metadata
    fields.splice(2, 0, {
      name: '\u200B',
      value: '__Hidden Traits__',
      inline: false
    });
  };

  // Keep if we want to auto show all metadata traits.
  //
	// Object.keys(attributes).forEach(function (key) {
	// 	if (key != 'generation' && key != 'sequence') {
	// 		let $trait = {
	// 			name: key,
	// 			value: attributes[key] ?? 'n/a',
	// 			inline: true
	// 		};
	// 		fields.push($trait);
	// 	}
	// });

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
    title: `${data.item.name} Listed for:\u000A${data.item.market_place_state.price} SOL`,
    description: '\u200B',
    url: `https://hyperspace.xyz/token/${data.token_address}`,
    image: {
      url: encodeURI(data.item.meta_data_img),
      width: 1069,
      height: 1069,
    },
		fields: fields,
		author: {
			name: `${data.action_type}  →  Rank: ${data.item?.rank_est}`
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
