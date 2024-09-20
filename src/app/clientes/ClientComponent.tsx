'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './ClientComponent.module.css';
import Image from 'next/image'; // Importando o componente Image de next/image
import QRCodeDisplay from '../../components/QRCodeDisplay'; // Ajuste o caminho conforme necessário

interface Cliente {
  nome: string;
  numero: string;
  link: string;
}

const ClientComponent = () => {
  // Inicializa o estado `clientes` com um array vazio
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mensagem, setMensagem] = useState('');
  const [clientesSelecionados, setClientesSelecionados] = useState<Cliente[]>([]);
  const [pesquisa, setPesquisa] = useState('');
  const [enviarParaTodos, setEnviarParaTodos] = useState(false);
  const [clientesEnviados, setClientesEnviados] = useState<Cliente[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  // Faz o fetch dos dados da API e garante que `clientes` seja sempre um array
  useEffect(() => {
    fetch('/api/clientes')
      .then(response => response.json())
      .then(data => setClientes(Array.isArray(data) ? data : []))  // Garante que `clientes` seja sempre um array
      .catch(error => console.error('Erro ao buscar clientes:', error));
  }, []);

  const handleEnviarMensagem = async (event: React.FormEvent) => {
    event.preventDefault();
    const destinatarios = enviarParaTodos ? clientes : clientesSelecionados;

    if (destinatarios.length === 0) {
      alert('Por favor, selecione pelo menos um cliente.');
      return;
    }

    if (!mensagem.trim()) {
      alert('Por favor, digite uma mensagem.');
      return;
    }

    const formData = new FormData();
    formData.append('mensagem', mensagem);
    formData.append('clientesSelecionados', JSON.stringify(destinatarios));
    if (selectedImage) {
      formData.append('imagem', selectedImage);
    }

    console.log('Dados sendo enviados:');
    console.log('Mensagem:', mensagem);
    console.log('Clientes selecionados:', destinatarios);
    console.log('Imagem selecionada:', selectedImage ? selectedImage.name : 'Nenhuma');

    try {
      const response = await fetch('/api/enviar-mensagem', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setClientesEnviados(destinatarios);
        alert(result.message || 'Mensagens enviadas com sucesso!');
      } else {
        const errorData = await response.json();
        console.error('Resposta do servidor:', errorData);
        alert(`Erro ao enviar mensagens: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagens. Verifique o console para mais detalhes.');
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  const handleSelecionarCliente = (cliente: Cliente) => {
    setClientesSelecionados(prevState =>
      prevState.includes(cliente)
        ? prevState.filter(c => c !== cliente)
        : [...prevState, cliente]
    );
  };

  // Protege o uso do `filter` garantindo que `clientes` seja um array
  const clientesFiltrados = Array.isArray(clientes) ? clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(pesquisa.toLowerCase())
  ) : [];

  const handleUpdateClients = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/updateClients', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        // Atualiza a lista de clientes
        fetchClients();
      } else {
        throw new Error('Falha ao atualizar clientes');
      }
    } catch (error) {
      console.error('Erro ao atualizar clientes:', error);
      alert('Erro ao atualizar clientes. Por favor, tente novamente.');
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchClients = () => {
    fetch('/api/clientes')
      .then(response => response.json())
      .then(data => setClientes(Array.isArray(data) ? data : []))
      .catch(error => console.error('Erro ao buscar clientes:', error));
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.logo}>
          {/* Substituindo <img> por <Image> */}
          <Image src="/path/to/logo.png" alt="Logo" width={150} height={150} style={{ width: 'auto', height: 'auto' }} />
        </div>
        <h1>Enviar Mensagens</h1>
        
        {/* Botão para mostrar/esconder o QR Code */}
        <button onClick={() => setShowQRCode(!showQRCode)} className={styles.qrCodeButton}>
          {showQRCode ? 'Esconder QR Code' : 'Mostrar QR Code'}
        </button>
        
        {/* Exibir o QRCodeDisplay quando showQRCode for true */}
        {showQRCode && <QRCodeDisplay />}
        
        <form onSubmit={handleEnviarMensagem} className={styles.formGroup}>
          <label htmlFor="messageTemplate">Mensagem (use {`{link}`} para substituir pelo link do cliente):</label>
          <textarea
            id="messageTemplate"
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
            required
          />
          <label htmlFor="select-option">Enviar para:</label>
          <select
            id="select-option"
            value={enviarParaTodos ? 'all' : 'some'}
            onChange={e => setEnviarParaTodos(e.target.value === 'all')}
            required
          >
            <option value="all">Todos os Clientes</option>
            <option value="some">Selecionar Alguns Clientes</option>
          </select>
          {!enviarParaTodos && (
            <div id="client-select">
              <label htmlFor="client-list">Selecione os Clientes:</label>
              <select
                id="client-list"
                multiple
                size={10}
                value={clientesSelecionados.map(cliente => cliente.numero)}
                onChange={e => {
                  const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
                  setClientesSelecionados(clientes.filter(cliente => selectedOptions.includes(cliente.numero)));
                }}
                className={styles.multiSelect}
              >
                {clientesFiltrados.map(cliente => (
                  <option key={cliente.numero} value={cliente.numero}>
                    {cliente.nome} ({cliente.numero})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="image-upload">Selecionar imagem (opcional):</label>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageSelect}
              ref={fileInputRef}
              className={styles.fileInput}
            />
          </div>
          {selectedImage && (
            <p>Imagem selecionada: {selectedImage.name}</p>
          )}
          <button type="submit" className={styles.submitButton}>Enviar Mensagens</button>
        </form>
        <button 
          onClick={handleUpdateClients} 
          disabled={isUpdating}
          className={styles.updateButton}
        >
          {isUpdating ? 'Atualizando...' : 'Atualizar Lista de Clientes'}
        </button>
      </div>

      <div className={styles.rightPanel}>
        <h2>Todos os Números Cadastrados</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(cliente => (
              <tr key={cliente.numero}>
                <td>{cliente.nome}</td>
                <td>{cliente.numero}</td>
                <td><a href={cliente.link} target="_blank" rel="noopener noreferrer">{cliente.link}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.sentPanel}>
        <h2>Mensagens Enviadas</h2>
        <ul>
          {clientesEnviados.map(cliente => (
            <li key={cliente.numero}>
              Enviado para: {cliente.nome} ({cliente.numero})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ClientComponent;
