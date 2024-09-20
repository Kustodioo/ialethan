import { QRCodeSVG } from 'qrcode.react';
import React, { useEffect, useState } from 'react';

const QRCodeDisplay: React.FC = () => {
  const [qrCode, setQRCode] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const response = await fetch('/api/get-qr-code');
        const data = await response.json();
        if (data.qr) {
          setQRCode(data.qr);
        }
        if (data.ready) {
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
        <QRCodeSVG
          value={qrCode}
          size={256}
          level="H"
          includeMargin={true}
        />
      ) : (
        <p>Aguardando QR code...</p>
      )}
    </div>
  );
};

export default QRCodeDisplay;
