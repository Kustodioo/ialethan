import React, { useEffect, useState } from 'react';
import ClienteLista from '../components/ClienteList';
import Mensagem from '../components/MensagemForm';

const App: React.FC = () => {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    fetch('/api/clientes')
      .then(response => response.json())
      .then(data => setClientes(data));
  }, []);

  return (
    <div>
      <h1>Enviar Mensagens para Clientes</h1>
      <ClienteLista clientes={clientes} />
      <Mensagem />
    </div>
  );
};

export default App;