import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { parsePhoneNumber } from 'libphonenumber-js';
import { MessageMedia } from 'whatsapp-web.js';
import fs from 'fs';
import path from 'path';
import whatsappClient from '../../utils/whatsappClient';

// Adicione esta interface
interface NextApiRequestWithFile extends NextApiRequest {
    file?: Express.Multer.File;
}

// Configuração do multer
const upload = multer({ dest: '/tmp' });

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequestWithFile, res: NextApiResponse) {
    if (req.method === 'POST') {
        const multerMiddleware = upload.single('imagem');

        multerMiddleware(req as any, res as any, async (err) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao processar o upload do arquivo' });
            }

            try {
                await whatsappClient.waitForReady();
            } catch (error) {
                console.error('Erro ao esperar pelo cliente WhatsApp:', error);
                return res.status(500).json({ error: 'Cliente WhatsApp não está pronto' });
            }

            const { clientesSelecionados, mensagem } = req.body;

            console.log('Dados recebidos:');
            console.log('Clientes selecionados:', clientesSelecionados);
            console.log('Mensagem:', mensagem);
            console.log('Arquivo:', req.file);

            if (!clientesSelecionados || !mensagem) {
                return res.status(400).json({ error: 'Faltam dados para o envio da mensagem' });
            }

            const clientes = JSON.parse(clientesSelecionados);

            let media: MessageMedia | undefined;
            if (req.file) {
                const fileData = fs.readFileSync(req.file.path);
                const base64Data = fileData.toString('base64');
                media = new MessageMedia('image/png', base64Data, path.basename(req.file.originalname));
            }

            for (const cliente of clientes) {
                try {
                    const phoneNumber = parsePhoneNumber(cliente.numero, 'BR');
                    if (!phoneNumber || !phoneNumber.isValid()) {
                        throw new Error(`Número de telefone inválido: ${cliente.numero}`);
                    }
                    const formattedNumber = phoneNumber.format('E.164').slice(1);

                    const mensagemFinal = mensagem.replace('{link}', cliente.link);

                    if (media) {
                        await whatsappClient.sendMessage(`${formattedNumber}@c.us`, media, { caption: mensagemFinal });
                    } else {
                        await whatsappClient.sendMessage(`${formattedNumber}@c.us`, mensagemFinal);
                    }

                    console.log(`Mensagem enviada para ${cliente.nome} (${formattedNumber})`);
                } catch (error) {
                    console.error(`Erro ao enviar mensagem para ${cliente.nome}:`, error);
                }
            }

            // Remover o arquivo temporário após o envio
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }

            res.status(200).json({ message: 'Mensagens enviadas com sucesso' });
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
