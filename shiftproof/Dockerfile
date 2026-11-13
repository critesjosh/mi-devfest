# ShiftProof container for IBM Cloud Code Engine. Secrets come from Code Engine, never from this image.
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production PORT=8080 NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/data ./data
RUN mkdir -p .data && chown -R node:node /app
USER node
EXPOSE 8080
CMD ["npx", "next", "start", "-p", "8080"]
