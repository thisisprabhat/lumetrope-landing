# Production image for the Lumetrope landing site (used by Coolify).
# Builds the static site (no Rust needed; the engine is vendored), then serves dist/ with nginx
# using deploy/nginx.conf. TLS is terminated by the Coolify proxy in front of port 80.
FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack install && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /var/www/lumetrope-landing
EXPOSE 80
