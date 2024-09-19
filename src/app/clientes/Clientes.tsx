import React, { useEffect, useState } from 'react';

interface Cliente {
  nome: string;
  numero: string;
  link: string;
}

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    fetch('/api/clientes')
      .then(response => response.json())
      .then(data => setClientes(data))
      .catch(error => console.error('Erro ao buscar clientes:', error));
  }, []);

  return (
    <div>
      <h1>Lista de Clientes</h1>
      <ul>
        {clientes.map((cliente, index) => (
          <li key={index}>
            <p>Nome: {cliente.nome}</p>
            <p>Número: {cliente.numero}</p>
            <p>Link: <a href={cliente.link} target="_blank" rel="noopener noreferrer">{cliente.link}</a></p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Clientes;