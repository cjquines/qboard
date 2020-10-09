FROM node:14-alpine

ENV WORKDIR=/qboard
ENV USER=qboard
ENV GROUP=$USER

WORKDIR $WORKDIR

RUN addgroup -S $GROUP \
 && adduser -S $USER -G $GROUP -D \
 && chown $USER:$GROUP $WORKDIR
USER $USER 

COPY ./ .
 
RUN npm install nwb@0.25.2
RUN npm run build 

ENTRYPOINT ["npm"]
CMD ["start"]
EXPOSE 3000
