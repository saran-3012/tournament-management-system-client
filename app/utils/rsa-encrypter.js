function convertPemToBinary(pem) {
  const b64 = pem.replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\n/g, '')
    .replace(/ /g, '');
  const binaryString = window.atob(b64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function encryptData(pem, data) {
  const binaryDer = convertPemToBinary(pem);

  return window.crypto.subtle.importKey(
    "spki",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: { name: "SHA-256" }
    },
    true,
    ["encrypt"]
  )
  .then(publicKey => {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    return window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      encodedData
    );
  })
  .then(encryptedData => {
    const base64Encrypted = btoa(String.fromCharCode(...new Uint8Array(encryptedData)));
    return base64Encrypted;
  })
  .catch(error => {
    console.error("Encryption error:", error);
    throw new Error('Something went wrong');
  });
}

export default function rsaEncrypter(data) {
  return encryptData(`-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAm590+M8v/WDQkONQ0dRF
8gTncNJ2kCZSBKoBsAm1vuqMKP4a6DeqXlblOUvVQDnlz9CXaN3lyUsLaoImSKKA
pt9eB/tVvkAig/rUNYRSBoMUYBkp7LKpobUouJIE21FUXI7c2hPa6ep7khNKfiMg
lLR+iOGqLTHKLF+Wcv9Z1mcVXkLBmsOOyGtRpopcO7WaraIPlLxe0OtzMsJYDWXR
9rylX3Vyke5Cak5ZuaCCrruonFUZOZspR6sjvYo/hd1maXve3aK/M7K15T1xFz82
Qdpvuo6tcp+rUaSSSZTRmicW+5aYNDNIC9h3p/Ispui236tze0Y0v338DdDqjCK/
qQIDAQAB
-----END PUBLIC KEY-----
`, data);
}
