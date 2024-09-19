import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import db from '../../db/connection';  // Importa a conexão com o banco de dados
import { RowDataPacket } from 'mysql2';  // Importa o tipo RowDataPacket do mysql2

// Função para formatar o número de telefone
const formatPhoneNumber = (phone: string): string => {
  // Remove caracteres especiais (espaços, parênteses, hífens)
  phone = phone.replace(/[^\d]/g, '');

  // Se o número tem 11 dígitos (com o "9" extra), remova o "9" após o DDD
  if (phone.length === 11 && phone.startsWith('9', 3)) {
    phone = phone.substring(0, 3) + phone.substring(4);
  }

  // Adiciona o código do Brasil (55) ao número
  return `55${phone}`;
};

// Função principal para atualizar o arquivo JSON
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Executa a consulta SQL usando Promises com `mysql2`
      const [rows] = await db.execute<RowDataPacket[]>(`
        SELECT name, phone, CONCAT('https://www.grupolethan.com.br/?referral_link=', link_ref) AS link
        FROM users
      `);

      // Verifica se a consulta retornou dados válidos
      if (!Array.isArray(rows)) {
        throw new Error('Os resultados da consulta não são uma lista.');
      }

      // Processa os resultados da consulta, ignorando o ID
      const formattedResults = rows.map((row: RowDataPacket) => ({
        nome: row.name,
        numero: formatPhoneNumber(row.phone), // Formata o número corretamente
        link: row.link,
      }));

      // Caminho absoluto para salvar o arquivo JSON
      const filePath = path.resolve('src', 'app', 'clientes.json');
      const dirPath = path.dirname(filePath);

      // Verificar se o diretório existe, e criar se não existir
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Salva o arquivo JSON
      fs.writeFile(filePath, JSON.stringify(formattedResults, null, 2), (err) => {
        if (err) {
          console.error('Erro ao salvar o arquivo JSON:', err.message);
          return res.status(500).json({ error: 'Erro ao salvar o arquivo JSON' });
        }

        res.status(200).json({ message: 'Clientes atualizados com sucesso!' });
      });
    } catch (error) {
      console.error('Erro inesperado:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}
