import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // Importando utilidades para lidar com __dirname no ES Modules
// Corrigir __dirname para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import whatsappWeb from 'whatsapp-web.js';
const { Client, MessageMedia } = whatsappWeb;
import qrcode from 'qrcode-terminal';
const app = express();
const PORT = 3000;
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public'))); // Agora usando o __dirname corrigido
// Corrigir o caminho para apontar para src/app/clientes.json
const clients = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/app/clientes.json'), 'utf8'));
const whatsappClient = new Client({ puppeteer: { headless: true } });
// Exibir QR Code no terminal para autenticação
whatsappClient.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});
// Evento de inicialização bem-sucedida
whatsappClient.on('ready', () => {
    console.log('WhatsApp Web está pronto!');
});
whatsappClient.initialize(); // Sem argumentos
// Rota para obter a lista de clientes
app.get('/api/clientes', (req, res) => {
    res.json(clients);
});
// Rota para enviar mensagens via WhatsApp
app.post('/api/enviar-mensagem', async (req, res) => {
    const { clientesSelecionados, mensagem, imagemBase64 } = req.body;
    // Enviar mensagem para cada cliente
    for (const cliente of clientesSelecionados) {
        try {
            if (imagemBase64) {
                const media = new MessageMedia('image/png', imagemBase64);
                await whatsappClient.sendMessage(cliente.numero + '@c.us', media, { caption: mensagem });
            }
            else {
                await whatsappClient.sendMessage(cliente.numero + '@c.us', mensagem);
            }
            console.log(`Mensagem enviada para ${cliente.nome} (${cliente.numero})`);
        }
        catch (error) {
            console.error(`Erro ao enviar mensagem para ${cliente.nome}:`, error);
        }
    }
    res.send('Mensagens enviadas com sucesso!');
});
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
