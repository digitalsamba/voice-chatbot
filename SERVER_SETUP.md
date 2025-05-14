# Server Setup Guide for Voice Chatbot

This guide outlines the steps for setting up your server to host the Voice Chatbot application using Docker, nginx-proxy, and Let's Encrypt.

## Prerequisites

Before setting up the application, ensure your server has:

1. **Docker and Docker Compose installed**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Install Docker Compose
   sudo apt-get install docker-compose-plugin
   ```

2. **A domain name pointing to your server**
   - Configure DNS settings to point your domain to your server's IP address
   - Make sure both A record (IPv4) and AAAA record (IPv6) if applicable are set up

3. **Open ports for HTTP and HTTPS**
   ```bash
   # Open ports 80 and 443 on your firewall
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

## Setting Up nginx-proxy with Let's Encrypt

The Voice Chatbot deployment relies on [nginx-proxy](https://github.com/nginx-proxy/nginx-proxy) and [acme-companion](https://github.com/nginx-proxy/acme-companion) for handling SSL and virtual host routing.

1. **Create a directory for nginx-proxy**
   ```bash
   mkdir -p /opt/nginx-proxy
   cd /opt/nginx-proxy
   ```

2. **Create a docker-compose.yml file**
   ```bash
   cat > docker-compose.yml << 'EOL'
   version: '3'
   
   services:
     nginx-proxy:
       image: nginxproxy/nginx-proxy
       container_name: nginx-proxy
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - ./conf.d:/etc/nginx/conf.d
         - ./vhost.d:/etc/nginx/vhost.d
         - ./html:/usr/share/nginx/html
         - ./certs:/etc/nginx/certs:ro
         - /var/run/docker.sock:/tmp/docker.sock:ro
       restart: always
       networks:
         - nginx-proxy-network
   
     acme-companion:
       image: nginxproxy/acme-companion
       container_name: nginx-proxy-acme
       volumes_from:
         - nginx-proxy
       volumes:
         - ./certs:/etc/nginx/certs:rw
         - ./acme:/etc/acme.sh
         - /var/run/docker.sock:/var/run/docker.sock:ro
       restart: always
       depends_on:
         - nginx-proxy
       networks:
         - nginx-proxy-network
   
   networks:
     nginx-proxy-network:
       name: nginx-proxy-network
       external: false
   EOL
   ```

3. **Start the nginx-proxy and acme-companion containers**
   ```bash
   docker-compose up -d
   ```

4. **Verify that the containers are running**
   ```bash
   docker-compose ps
   ```

## Preparing for Voice Chatbot Deployment

1. **Create network for nginx-proxy if it doesn't already exist**
   ```bash
   docker network create nginx-proxy-network
   ```

2. **Create directory for the application logs**
   ```bash
   mkdir -p /opt/voice-chatbot/logs
   chmod 777 /opt/voice-chatbot/logs
   ```

3. **Verify nginx-proxy configuration**
   Make sure that the nginx-proxy container is properly configured and running:
   ```bash
   docker ps | grep nginx-proxy
   ```

## Testing Your Setup

Before the GitHub Actions workflow deploys the application, you can verify your setup:

1. **Test that nginx-proxy is working**
   ```bash
   # Create a simple test container
   docker run -d --name test-web \
     -e VIRTUAL_HOST=test.yourdomain.com \
     -e LETSENCRYPT_HOST=test.yourdomain.com \
     -e LETSENCRYPT_EMAIL=your-email@example.com \
     --network nginx-proxy-network \
     nginxdemos/hello
   ```

2. **Check if Let's Encrypt certificate was issued**
   ```bash
   # The certificate may take a few minutes to be issued
   docker exec -it nginx-proxy ls -la /etc/nginx/certs
   ```

3. **Remove the test container when done**
   ```bash
   docker rm -f test-web
   ```

## Troubleshooting

If you encounter issues with Let's Encrypt certificate issuance:

1. **Check acme-companion logs**
   ```bash
   docker logs nginx-proxy-acme
   ```

2. **Verify that ports 80 and 443 are accessible**
   - Test with: `curl -I http://yourdomain.com`
   - Ensure your firewall and cloud provider allow these ports

3. **Check DNS configuration**
   - Make sure your domain correctly points to your server's IP
   - Test with: `dig yourdomain.com`

## Next Steps

Once your server is set up, you can add the required secrets to your GitHub repository and let the GitHub Actions workflow deploy the Voice Chatbot application.

For more information, see [GITHUB_SETUP.md](GITHUB_SETUP.md).