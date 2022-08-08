import dotenv from "dotenv";
import {Env, loadConfig} from "config";
import logger from "lib/logger";
import startAblyFeedFor from "lib/ably";

const result = dotenv.config();

if (result.error) {
  throw result.error;
}

const config = loadConfig(process.env as Env);
const {subscriptions, bannedTokens} = config;

if (!subscriptions.length) {
  logger.warn('No subscriptions loaded');
}

if (bannedTokens.length) {
  logger.log(`Banned Tokens: ${bannedTokens}`);
}

subscriptions.map((s) => {
  startAblyFeedFor(s.projectChannel, s.discordChannelId);
});
