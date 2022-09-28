FROM --platform=linux/amd64 node:16 as dependencies
WORKDIR /pirate-listing-bot
COPY package.json yarn.lock .env ./
RUN yarn install --frozen-lockfile

FROM --platform=linux/amd64 node:16 as builder
WORKDIR /pirate-listing-bot
COPY . .
COPY --from=dependencies /pirate-listing-bot/node_modules ./node_modules
COPY --from=dependencies /pirate-listing-bot/.env ./.env
RUN yarn build

FROM --platform=linux/amd64 node:16 as runner
WORKDIR /pirate-listing-bot
ENV NODE_ENV production
# If you are using a custom next.config.js file, uncomment this line.
# COPY --from=builder /pirate-listing-bot/next.config.js ./
COPY --from=builder /pirate-listing-bot/dist ./dist
COPY --from=builder /pirate-listing-bot/node_modules ./node_modules
COPY --from=builder /pirate-listing-bot/package.json ./package.json
COPY --from=builder /pirate-listing-bot/.env ./.env

EXPOSE 4000
CMD ["yarn", "start"]
