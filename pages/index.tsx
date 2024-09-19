import React from 'react';
import UpdateButton from '../src/components/UpdateButton';

const Home = () => {
  return (
    <div>
      <h1>Gerenciar Clientes</h1>
      <p>Atualize a lista de clientes e o banco de dados clicando no botão abaixo.</p>
      <UpdateButton />
    </div>
  );
};

export default Home;
