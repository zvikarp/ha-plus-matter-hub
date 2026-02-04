ARG NODE_VERSION="22"
ARG PACKAGE_VERSION="unknown"

FROM node:${NODE_VERSION}-alpine
RUN apk add --no-cache netcat-openbsd

ENV HAMH_STORAGE_LOCATION="/data"
VOLUME /data

LABEL package.version="$PACKAGE_VERSION"

RUN mkdir /install
COPY package.tgz /install/package.tgz
RUN npm install -g /install/package.tgz
RUN rm -rf /install

# Verify that the CLI is working and @ha-plus-matter-hub/common can be resolved
RUN ha-plus-matter-hub --help > /dev/null && echo "✓ CLI verification passed"

CMD exec ha-plus-matter-hub start
