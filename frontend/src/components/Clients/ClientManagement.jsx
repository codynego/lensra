// ClientManagement.js
import React, { useState } from 'react';
import ClientList from './ClientList';
import ClientDetail from './ClientDetail';
import ClientForm from './ClientForm';

const ClientManagement = () => {
  const [currentView, setCurrentView] = useState('list');
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setCurrentView('detail');
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setCurrentView('form');
  };

  const handleCreateClient = () => {
    setEditingClient(null);
    setCurrentView('form');
  };

  const handleCreateBooking = (client) => {
    alert(`Create booking for ${client.name} - integrate with your booking component`);
  };

  const handleFormSave = () => {
    setCurrentView('list');
    setEditingClient(null);
  };

  const handleFormCancel = () => {
    setCurrentView(selectedClient ? 'detail' : 'list');
    setEditingClient(null);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedClient(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {currentView === 'list' && (
          <ClientList
            onSelectClient={handleSelectClient}
            onCreateClient={handleCreateClient}
            onEditClient={handleEditClient}
          />
        )}
        
        {currentView === 'detail' && (
          <ClientDetail
            client={selectedClient}
            onBack={handleBackToList}
            onEdit={handleEditClient}
            onCreateBooking={handleCreateBooking}
          />
        )}
        
        {currentView === 'form' && (
          <ClientForm
            client={editingClient}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        )}
      </div>
    </div>
  );
};

export default ClientManagement;