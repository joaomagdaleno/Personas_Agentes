#!/bin/bash
# Generate Dev mTLS Certificates for Sovereign Hub (Linux/Mac)

# CA
openssl req -x509 -newkey rsa:4096 -keyout ca.key -out ca.crt -days 3650 -nodes -subj "/CN=SovereignCA"

# Server
openssl req -newkey rsa:4096 -keyout server.key -out server.csr -nodes -subj "/CN=localhost"
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -days 3650

# Client
openssl req -newkey rsa:4096 -keyout client.key -out client.csr -nodes -subj "/CN=SovereignClient"
openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out client.crt -days 3650

# Cleanup
rm -f *.csr *.srl
echo "mTLS dev certificates generated successfully!"
