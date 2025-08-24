import React, { useState, useEffect } from 'react';
import ClientList from './ClientList';
import ClientDetail from './ClientDetail';
import ClientForm from './ClientForm';
import { useAuth } from '../../AuthContext';

const ClientManagement = ({theme}) => {
  const [currentView, setCurrentView] = useState('list');
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const { apiFetch, authState, user, checkPlanLimits, upgradePrompt, setUpgradePrompt } = useAuth();
  const currencySymbol = user?.stats?.currency_symbol || '#';

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
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      <div className="max-w-7xl mx-auto">
        {currentView === 'list' && (
          <ClientList
            onSelectClient={handleSelectClient}
            onCreateClient={handleCreateClient}
            onEditClient={handleEditClient}
            theme={theme}
          />
        )}
        
        {currentView === 'detail' && (
          <ClientDetail
            client={selectedClient}
            onBack={handleBackToList}
            onEdit={handleEditClient}
            onCreateBooking={handleCreateBooking}
            currencySymbol={currencySymbol}
            theme={theme}
          />
        )}
        
        {currentView === 'form' && (
          <ClientForm
            client={editingClient}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
};

export default ClientManagement;