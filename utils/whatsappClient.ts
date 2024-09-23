import { Client, LocalAuth } from 'whatsapp-web.js';
import EventEmitter from 'events';

export const whatsappEvents = new EventEmitter();

let client: Client;
let qrCodeData: string | null = null;

export async function initialize() {
  if (!client) {
    console.log('Iniciando inicialização do cliente WhatsApp...');
    client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    client.on('qr', (qr) => {
      console.log('QR Code gerado:', qr);
      qrCodeData = qr;
      whatsappEvents.emit('qr', qr);
    });

    client.on('ready', () => {
      console.log('Cliente WhatsApp está pronto!');
      qrCodeData = null;
      whatsappEvents.emit('ready');
    });

    console.log('Chamando client.initialize()...');
    await client.initialize();
  }
  return client;
}

export function getQRCode() {
  console.log('getQRCode chamado, qrCodeData:', qrCodeData);
  return qrCodeData;
}

export async function sendMessage(to: string, message: string) {
  if (!client) {
    await initialize();
  }
  return client.sendMessage(to, message);
}

export async function waitForReady() {
  if (!client) {
    await initialize();
  }
  return new Promise((resolve) => {
    if (client.info) {
      resolve(true);
    } else {
      client.once('ready', () => resolve(true));
    }
  });
}

// ... resto do código ...
