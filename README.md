# self-signed-certificate-front

This frontend project provides a simple web interface for generating self-signed certificates using the Vite framework.
By default, the root certificate is generated only once. It can be manually deleted through the web interface to
regenerate it if needed.

### Usage

Build Docker Image

```
docker build -t self-signed-certificate-front:v1 .
```

Run Docker Container

```
docker run --name self-signed-certificate-front \
  --link self-signed-certificate-service:self-signed-certificate-service \
  --restart always \
  -p 80:80 \
  -d self-signed-certificate-front:v1
```

Usage with Kubernetes

```
# modify self-signed-certificate-front.yaml
kubectl -n xxx apply -f self-signed-certificate-front.yaml
```
