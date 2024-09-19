import React from 'react';
import Link from 'next/link';

const Home = () => {
  return (
    <div>
      <h1>Bem-vindo ao Sistema de Mensagens</h1>
      <Link href="/clientes">
        Ver Clientes
      </Link>
    </div>
  );
};

export default Home;