FROM --platform=linux/amd64 node:16 as dependencies
WORKDIR /daoo-listing-bot
COPY package.json yarn.lock .env ./
RUN yarn install --frozen-lockfile

FROM --platform=linux/amd64 node:16 as builder
WORKDIR /daoo-listing-bot
COPY . .
COPY --from=dependencies /daoo-listing-bot/node_modules ./node_modules
COPY --from=dependencies /daoo-listing-bot/.env ./.env
RUN yarn build

FROM --platform=linux/amd64 node:16 as runner
WORKDIR /daoo-listing-bot
ENV NODE_ENV production
# If you are using a custom next.config.js file, uncomment this line.
# COPY --from=builder /daoo-listing-bot/next.config.js ./
COPY --from=builder /daoo-listing-bot/dist ./dist
COPY --from=builder /daoo-listing-bot/node_modules ./node_modules
COPY --from=builder /daoo-listing-bot/package.json ./package.json
COPY --from=builder /daoo-listing-bot/.env ./.env

EXPOSE 4000
CMD ["yarn", "start"]
