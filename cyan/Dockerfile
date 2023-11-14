FROM oven/bun:1.0.11
WORKDIR /app
RUN apt update -y
RUN apt install -y git
LABEL cyanprint.dev=true
COPY package.json .
COPY bun.lockb .
RUN bun install
COPY . .
CMD ["bun", "run", "index.ts"]
