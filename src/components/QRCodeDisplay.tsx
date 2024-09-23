import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QRCodeDisplay: React.FC = () => {
  const [qrCode, setQRCode] = useState<string | null>(null);
  const [qrCodeType, setQRCodeType] = useState<'image' | 'text' | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const response = await fetch('/api/get-qr-code');
        console.log('Response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Received data:', data);
          if (data.qr) {
            setQRCode(data.qr);
            setQRCodeType(data.type);
          }
        } else if (response.status === 204) {
          console.log('No QR code available');
          setIsReady(true);
        }
      } catch (error) {
        console.error('Erro ao buscar QR code:', error);
      }
    };

    const interval = setInterval(fetchQRCode, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isReady) {
    return <p>WhatsApp está conectado!</p>;
  }

  return (
    <div>
      {qrCode ? (
        qrCodeType === 'image' ? (
          <img src={qrCode} alt="QR Code para conexão do WhatsApp" />
        ) : (
          <QRCodeSVG value={qrCode} size={256} />
        )
      ) : (
        <p>Aguardando QR code...</p>
      )}
    </div>
  );
};

export default QRCodeDisplay;
