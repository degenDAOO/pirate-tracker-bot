import axios from 'axios';
import CoinGecko from 'coingecko-api';
import { Env, loadConfig } from 'config';
import logger from "lib/logger";
import { TwitterApi } from 'twitter-api-v2';
import initTwitterClient from '.';

const config = loadConfig(process.env as Env);

export default async function notifyTwitter(
  message: string,
) {
  let twitterClient = await initTwitterClient(config.twitter) as TwitterApi

  const data = JSON.parse(message);

  const nftName = data.item.name;
  const seller = truncate(data.item.market_place_state.seller_address as string);
  const solPrice = await getSolInUSD();
  const priceInUSD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.item.market_place_state.price * solPrice);
  const text = `${nftName} was just listed!\n\n💸 Price: ${data.item.market_place_state.price.toFixed(2)} S◎L\n\n💵 USD: ${priceInUSD}\n\n🤝 Seller: ${seller}\n\n🚀 Buy Now: https://hyperspace.xyz/token/${data.token_address}\n\n🪙 Token: https://solscan.io/token/${data.token_address}#trades`
  const mediaArr: string[] = [];

  if (Boolean(data.item.meta_data_img)) {
    const imgData = await getImageDataFromUrl(data.item.meta_data_img as string);
    const media = await twitterClient.v1.uploadMedia(imgData, { mimeType: 'image/png' });
    mediaArr.push(media);
  }

  logger.log(`Notified Twitter about: ${nftName}`);

  return twitterClient.v1.tweet(text, {
      media_ids: mediaArr,
  })
}

async function getImageDataFromUrl(url: string) {
  const img = await axios.get(url, { responseType: "arraybuffer" });
  return img.data as Buffer;
}

async function getSolInUSD() {
  const CoinGeckoClient = new CoinGecko();

  return await CoinGeckoClient.simple.price({
      ids: ['solana'],
      vs_currencies: ['usd'],
  }).then(res => res.data.solana.usd);
}

export function truncate(str: String): string {
  return str.substring(0, 6) + '...' + str.substring(str.length - 6);
}