package main

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"fmt"
	"math/big"
	"net"
	"os"
	"time"
)

func savePEM(filename string, blockType string, bytes []byte) error {
	f, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer f.Close()
	return pem.Encode(f, &pem.Block{Type: blockType, Bytes: bytes})
}

func main() {
	fmt.Println("🔐 Gerando certificados mTLS soberanos para Go Hub...")

	// 1. CA
	caPrivKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		panic(err)
	}

	caTemplate := &x509.Certificate{
		SerialNumber: big.NewInt(202601),
		Subject: pkix.Name{
			Organization: []string{"Sovereign Hub CA"},
			CommonName:   "SovereignCA",
		},
		NotBefore:             time.Now(),
		NotAfter:              time.Now().AddDate(10, 0, 0),
		IsCA:                  true,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth, x509.ExtKeyUsageServerAuth},
		KeyUsage:              x509.KeyUsageDigitalSignature | x509.KeyUsageCertSign,
		BasicConstraintsValid: true,
	}

	caBytes, err := x509.CreateCertificate(rand.Reader, caTemplate, caTemplate, &caPrivKey.PublicKey, caPrivKey)
	if err != nil {
		panic(err)
	}

	if err := savePEM("ca.crt", "CERTIFICATE", caBytes); err != nil {
		panic(err)
	}
	if err := savePEM("ca.key", "RSA PRIVATE KEY", x509.MarshalPKCS1PrivateKey(caPrivKey)); err != nil {
		panic(err)
	}

	// 2. Server Cert (DNS: localhost, IP: 127.0.0.1)
	serverPrivKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		panic(err)
	}

	serverTemplate := &x509.Certificate{
		SerialNumber: big.NewInt(202602),
		Subject: pkix.Name{
			Organization: []string{"Sovereign Hub Server"},
			CommonName:   "localhost",
		},
		IPAddresses:  []net.IP{net.ParseIP("127.0.0.1")},
		DNSNames:     []string{"localhost"},
		NotBefore:    time.Now(),
		NotAfter:     time.Now().AddDate(10, 0, 0),
		SubjectKeyId: []byte{1, 2, 3, 4, 6},
		ExtKeyUsage:  []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth, x509.ExtKeyUsageServerAuth},
		KeyUsage:     x509.KeyUsageDigitalSignature,
	}

	serverBytes, err := x509.CreateCertificate(rand.Reader, serverTemplate, caTemplate, &serverPrivKey.PublicKey, caPrivKey)
	if err != nil {
		panic(err)
	}

	if err := savePEM("server.crt", "CERTIFICATE", serverBytes); err != nil {
		panic(err)
	}
	if err := savePEM("server.key", "RSA PRIVATE KEY", x509.MarshalPKCS1PrivateKey(serverPrivKey)); err != nil {
		panic(err)
	}

	// 3. Client Cert
	clientPrivKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		panic(err)
	}

	clientTemplate := &x509.Certificate{
		SerialNumber: big.NewInt(202603),
		Subject: pkix.Name{
			Organization: []string{"Sovereign Hub Client"},
			CommonName:   "SovereignClient",
		},
		NotBefore:    time.Now(),
		NotAfter:     time.Now().AddDate(10, 0, 0),
		SubjectKeyId: []byte{1, 2, 3, 4, 7},
		ExtKeyUsage:  []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth},
		KeyUsage:     x509.KeyUsageDigitalSignature,
	}

	clientBytes, err := x509.CreateCertificate(rand.Reader, clientTemplate, caTemplate, &clientPrivKey.PublicKey, caPrivKey)
	if err != nil {
		panic(err)
	}

	if err := savePEM("client.crt", "CERTIFICATE", clientBytes); err != nil {
		panic(err)
	}
	if err := savePEM("client.key", "RSA PRIVATE KEY", x509.MarshalPKCS1PrivateKey(clientPrivKey)); err != nil {
		panic(err)
	}

	fmt.Println("✅ Certificados mTLS (ca.crt, server.crt, server.key, client.crt, client.key) gerados com sucesso!")
}
