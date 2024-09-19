import React from 'react';

interface Cliente {
  nome: string;
  numero: string;
  link: string;
}

interface ClienteListaProps {
  clientes: Cliente[];
}

const ClienteLista: React.FC<ClienteListaProps> = ({ clientes }) => {
  return (
    <div id="clientes">
      {clientes.map(cliente => (
        <div key={cliente.numero}>
          <input type="checkbox" value={JSON.stringify(cliente)} id={cliente.numero} />
          <label htmlFor={cliente.numero}>{cliente.nome} ({cliente.numero})</label>
        </div>
      ))}
    </div>
  );
};

export default ClienteLista;