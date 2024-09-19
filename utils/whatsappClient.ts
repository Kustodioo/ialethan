import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import path from 'path';
import fs from 'fs-extra';

class WhatsAppClient {
  private static instance: WhatsAppClient;
  private client: Client;
  private isReady: boolean = false;
  private sessionPath: string;

  private constructor() {
    this.sessionPath = path.join(process.cwd(), '.wwebjs_auth');
    
    this.client = new Client({
      authStrategy: new LocalAuth({ 
        dataPath: this.sessionPath,
        clientId: 'client-one' // Adicione um ID único para o cliente
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    this.client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
      console.log('QR RECEIVED. Scan it with your WhatsApp app.');
    });

    this.client.on('ready', () => {
      console.log('WhatsApp client is ready!');
      this.isReady = true;
    });

    this.client.on('disconnected', async (reason) => {
      console.log('WhatsApp client was disconnected', reason);
      this.isReady = false;
      await this.cleanSession();
      this.initialize(); // Tenta reinicializar após desconexão
    });

    this.initialize();
  }

  public static getInstance(): WhatsAppClient {
    if (!WhatsAppClient.instance) {
      WhatsAppClient.instance = new WhatsAppClient();
    }
    return WhatsAppClient.instance;
  }

  private async initialize() {
    try {
      await this.client.initialize();
    } catch (error) {
      console.error('Failed to initialize WhatsApp client:', error);
      await this.cleanSession();
      // Tenta inicializar novamente após limpar a sessão
      setTimeout(() => this.initialize(), 5000);
    }
  }

  private async cleanSession() {
    try {
      await fs.remove(this.sessionPath);
      console.log('Session cleaned successfully');
    } catch (error) {
      console.error('Failed to clean session:', error);
    }
  }

  public async sendMessage(to: string, content: string | MessageMedia, options?: any) {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }
    return await this.client.sendMessage(to, content, options);
  }

  public async waitForReady(): Promise<void> {
    if (this.isReady) return;
    return new Promise((resolve) => {
      const checkReady = setInterval(() => {
        if (this.isReady) {
          clearInterval(checkReady);
          resolve();
        }
      }, 1000);
    });
  }
}

export default WhatsAppClient.getInstance();
