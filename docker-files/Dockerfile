FROM nginx:1.21.4-alpine

LABEL maintainer="cookeem"
LABEL email="cookeem@qq.com"
LABEL version="v1.6.1"

COPY nginx.conf /etc/nginx/nginx.conf
COPY dist /dory-dashboard

# npm run build
# mv dist docker-files
# cd docker-files
# docker build -t doryengine/dory-dashboard:v1.6.1 .
