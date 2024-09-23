import React, { useEffect, useState } from 'react';
import ClienteLista from '../components/ClienteList';

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
    </div>
  );
};

export default App;