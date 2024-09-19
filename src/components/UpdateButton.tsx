import React, { useState } from 'react';

const UpdateButton = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdate = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/updateClients', {
        method: 'POST', // ou 'GET' dependendo do seu setup
      });

      if (res.ok) {
        setMessage('Lista e banco de dados atualizados com sucesso!');
      } else {
        setMessage('Erro ao atualizar a lista.');
      }
    } catch (error) {
      setMessage('Erro na requisição.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleUpdate} disabled={loading}>
        {loading ? 'Atualizando...' : 'Atualizar Lista'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default UpdateButton;
