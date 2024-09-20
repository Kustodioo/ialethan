import { NextApiRequest, NextApiResponse } from 'next';
import { whatsappEvents, initialize } from '../../utils/whatsappClient';

let qrCode: string | null = null;
let isReady = false;

whatsappEvents.on('qr', (qr: string) => {
  qrCode = qr;
});

whatsappEvents.on('ready', () => {
  isReady = true;
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isReady && !qrCode) {
    try {
      await initialize();
    } catch (error) {
      console.error('Erro ao inicializar o cliente WhatsApp:', error);
      return res.status(500).json({ error: 'Erro ao inicializar o cliente WhatsApp' });
    }
  }

  res.status(200).json({ qr: qrCode, ready: isReady });
}
