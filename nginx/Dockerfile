FROM nginx:1.27-alpine

RUN apk add --no-cache openssl

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf
COPY generate-certs.sh /usr/local/bin/generate-certs.sh
RUN chmod +x /usr/local/bin/generate-certs.sh

EXPOSE 80 443

CMD ["/usr/local/bin/generate-certs.sh"]