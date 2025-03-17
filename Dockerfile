FROM node:20-alpine

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

# Install cron
RUN apk add --no-cache cron

# Copy cron config
COPY crontab /etc/crontabs/root

# Start cron daemon
CMD ["crond", "-f"]