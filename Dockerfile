FROM node:20-alpine

# Install crond for scheduling cron jobs
RUN apk add --no-cache busybox-suid

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

# Copy your cron configuration file into the container
COPY crontab /etc/crontabs/root

# Start cron daemon in foreground mode
CMD ["crond", "-f", "-l", "2"]