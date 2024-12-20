## Judge0 deployment to EC2

### Install Docker to EC2

1. Install docker

```
sudo yum install docker -y
```

2. Install docker-compose

```
sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

docker-compose version
```

3.  Start Docker Service

```
sudo systemctl start docker
```

### Deployment Steps

1. Download and extract the release archive:

```
wget https://github.com/judge0/judge0/releases/download/v1.13.1/judge0-v1.13.1.zip
unzip judge0-v1.13.1.zip
```

2. Update <code>REDIS_PASSWORD</code>, <code>POSGRES_PASSWORD</code>, <code>AUTHN_HEADER</code>, <code>AUTHN_TOKEN</code>, <code>AUTHZ_HEADER</code> and <code>AUTHZ_TOKEN</code>in <code>judge0.conf</code>

3. Run all services

```
cd judge0-v1.13.1
docker-compose up -d db redis
sleep 10s
docker-compose up -d
sleep 5s
```

### How to reverse proxy to redirect HTTP to HTTPS on EC2

1. Find a domain name for your EC2 instance
2. Install Nginx on EC2

```
sudo apt update
sudo apt install nginx -y
```

3. Start Nignx and enable it to run on boot:

```
sudo systemctl start nginx
sudo systemctl enable nginx
```

4. Allow HTTPS traffic in Security Group

- Go to the AWS Management Console
- Navigate to EC2 > Security Group
- Add Inbound Rules to allow:
  - Port 80 for HTTP (if not already open)
  - Port 443 for HTTPS

5. Install Certbot for Let's encrypt
   Certbot will automatically obtain and configure a free SSL certificate from Let's Encrypt.

```
sudo apt install certbot python3-certbot-nginx -y
```

6. Configure Nginx as a Reverse Proxy

   1. Find this block:

   ```
   location / {
       try_files $uri $uri/ =404;
   }
   ```

   2. Replace it with:

   ```
   location / {
    proxy_pass http://127.0.0.1:2358; # Proxy to Judge0 running on port 2358
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
   }
   ```

7. Install SSL Certificate Using Certbot
   Install Cert for your domain name of your ec2. Note that IP address won't work

```
sudo certbot --nginx -d your-domain.com
```

8. Restart nginx

```
sudo systemctl restart nginx
```
