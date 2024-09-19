import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { Client, MessageMedia } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { promisify } from 'util';
import { RequestHandler } from 'express';
import parsePhoneNumber from 'libphonenumber-js';
import cors from 'cors';  // Adicione esta linha

// Configuração para ES Modules (corrige __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(cors());

// Definição do tipo Cliente
interface Cliente {
  nome: string;
  numero: string;
  link: string;
}

// Definição da interface FileRequest
interface FileRequest extends Request {
  file?: Express.Multer.File;
}

// Rota que retorna a lista de clientes
app.get('/api/clientes', (req: Request, res: Response) => {
  const clients: Cliente[] = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/app/clientes.json'), 'utf8'));
  res.json(clients);
});

// Configurando o cliente WhatsApp Web
const whatsappClient = new Client({ puppeteer: { headless: true } });

// Exibir QR Code no terminal para autenticação
whatsappClient.on('qr', (qr: string) => {
  qrcode.generate(qr, { small: true });
});

// Evento de inicialização bem-sucedida do WhatsApp
whatsappClient.on('ready', () => {
  console.log('WhatsApp Web está pronto!');
});

whatsappClient.initialize(); // Inicializando o cliente WhatsApp Web

// Rota para enviar mensagens via WhatsApp
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // limite de 5MB
});

app.post('/api/enviar-mensagem', upload.single('imagem'), async (req: Request, res: Response) => {
  console.log('Recebida solicitação para enviar mensagem');
  console.log('Body:', req.body);
  console.log('File:', req.file);
  console.log('Headers:', req.headers);

  try {
    const { clientesSelecionados, mensagem } = req.body;
    
    if (!clientesSelecionados) {
      return res.status(400).json({ error: 'Lista de clientes não fornecida' });
    }
    
    if (!mensagem) {
      return res.status(400).json({ error: 'Mensagem não fornecida' });
    }

    let clientes;
    try {
      clientes = JSON.parse(clientesSelecionados);
    } catch (error) {
      console.error('Erro ao fazer parse de clientesSelecionados:', error);
      return res.status(400).json({ error: 'Erro ao processar lista de clientes' });
    }

    if (!Array.isArray(clientes) || clientes.length === 0) {
      console.error('Lista de clientes inválida:', clientes);
      return res.status(400).json({ error: 'Lista de clientes inválida ou vazia' });
    }

    for (const cliente of clientes) {
      try {
        const phoneNumber = parsePhoneNumber(cliente.numero, 'BR');
        if (!phoneNumber || !phoneNumber.isValid()) {
          throw new Error(`Número de telefone inválido: ${cliente.numero}`);
        }
        const formattedNumber = phoneNumber.format('E.164').slice(1);

        const mensagemFinal = mensagem.replace('{link}', cliente.link);

        if (req.file) {
          const media = MessageMedia.fromFilePath(req.file.path);
          await whatsappClient.sendMessage(`${formattedNumber}@c.us`, media, { caption: mensagemFinal });
        } else {
          await whatsappClient.sendMessage(`${formattedNumber}@c.us`, mensagemFinal);
        }

        console.log(`Mensagem enviada para ${cliente.nome} (${formattedNumber})`);
      } catch (error) {
        console.error(`Erro ao enviar mensagem para ${cliente.nome}:`, error);
      }
    }

    // Remover o arquivo de upload após o envio
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.json({ message: 'Mensagens enviadas com sucesso!' });
  } catch (error) {
    console.error('Erro ao processar solicitação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
