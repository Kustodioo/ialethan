import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Cliente {
  nome: string;
  numero: string;
  link: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), 'src', 'app', 'clientes.json');  // Certifique-se de que este caminho está correto.
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');  // Lê o arquivo JSON
    const clients: Cliente[] = JSON.parse(fileContents);     // Faz o parse dos dados
    res.status(200).json(clients);                           // Retorna os dados como JSON
  } catch (error) {
    console.error('Erro ao ler o arquivo clientes.json:', error);
    res.status(500).json({ error: 'Erro ao ler o arquivo clientes.json' });
  }
}
