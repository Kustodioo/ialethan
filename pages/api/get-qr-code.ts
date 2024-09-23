import { NextApiRequest, NextApiResponse } from 'next';
import { initialize, getQRCode } from '../../utils/whatsappClient';
import QRCode from 'qrcode';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      await initialize();
      const qrCodeData = getQRCode();
      console.log('API: QR Code data:', qrCodeData);

      if (qrCodeData) {
        try {
          const qrCodeImage = await QRCode.toDataURL(qrCodeData);
          res.status(200).json({ qr: qrCodeImage, type: 'image' });
        } catch (error) {
          console.error('Erro ao gerar imagem QR code:', error);
          res.status(200).json({ qr: qrCodeData, type: 'text' });
        }
      } else {
        console.log('API: QR Code não disponível');
        res.status(204).end(); // No Content
      }
    } catch (error) {
      console.error('Erro ao gerar QR code:', error);
      res.status(500).json({ error: 'Erro ao gerar QR code' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
