FROM node:14-alpine

ENV WORKDIR=/qboard
ENV USER=qboard
ENV GROUP=$USER

WORKDIR $WORKDIR

RUN addgroup -S $GROUP \
 && adduser -S $USER -G $GROUP -D \
 && chown $USER:$GROUP $WORKDIR
USER $USER

COPY package.json ./
COPY package-lock.json ./

RUN npm ci

COPY . .

ENTRYPOINT ["npm"]
CMD ["start"]
EXPOSE 3000
