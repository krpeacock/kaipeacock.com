FROM ghcr.io/getzola/zola:v0.19.1 AS zola

COPY . /project
WORKDIR /project

EXPOSE 1111

RUN ["zola", "serve"]