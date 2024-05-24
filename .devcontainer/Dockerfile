FROM "node:16-bullseye"

RUN apt-get update \
    && apt-get install chromium fonts-noto-color-emoji -y --no-install-recommends -qq

# The rest of our environment
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV CHROME_PATH=/usr/bin/chromium
ENV DEBIAN_FRONTEND=noninteractive