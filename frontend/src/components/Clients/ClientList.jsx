import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit2, Trash2, Calendar, DollarSign, User, Eye, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../useApi';

const ClientList = ({ onSelectClient, onCreateClient, onEditClient }) => {
  const { apiFetch } = useApi();
  const navigate = useNavigate();
  const apiFetchRef = useRef(apiFetch); // Cache apiFetch to avoid re-renders
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // Matches backend PAGE_SIZE
  const [totalCount, setTotalCount] = useState(0);
  const [userStats, setUserStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Update apiFetchRef when apiFetch changes
  useEffect(() => {
    console.log('Updating apiFetchRef');
    apiFetchRef.current = apiFetch;
  }, [apiFetch]);

  // Fetch user stats to check plan limits
  async function loadUserStats() {
    let isMounted = true;
    try {
      console.log('Fetching /subscriptions/me/stats/');
      setStatsLoading(true);
      const response = await apiFetchRef.current('/subscriptions/me/stats/');
      if (!response || !response.ok) {
        throw new Error('Failed to fetch user stats');
      }
      const data = await response.json();
      if (isMounted) {
        setUserStats(data);
      }
    } catch (err) {
      console.error('Error loading user stats:', err);
      // Don't set error for stats failure - component should still work
    } finally {
      if (isMounted) {
        setStatsLoading(false);
      }
    }
  }

  // Fetch clients with pagination
  async function loadClients() {
    let isMounted = true;
    try {
      console.log(`Fetching /photographers/clients/?page=${currentPage}&page_size=${pageSize}`);
      setLoading(true);
      setError(null);
      const response = await apiFetchRef.current(`/photographers/clients/?page=${currentPage}&page_size=${pageSize}`);
      if (!response || !response.ok) {
        throw new Error('Failed to load clients');
      }
      const data = await response.json();
      if (isMounted) {
        setClients(data.results || []);
        setTotalCount(data.count || 0);
      }
    } catch (err) {
      if (isMounted) {
        setError('Failed to load clients');
        console.error('Error loading clients:', err);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }

  // Fetch stats and clients separately
  useEffect(() => {
    loadUserStats();
  }, []); // Run once on mount

  useEffect(() => {
    loadClients();
  }, [currentPage, pageSize]); // Run when pagination changes

  async function handleDeleteClient(id) {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        console.log(`Deleting /photographers/clients/${id}/`);
        const response = await apiFetchRef.current(`/photographers/clients/${id}/`, {
          method: 'DELETE',
        });
        if (!response || !response.ok) {
          throw new Error(`Failed to delete client: ${response?.status || 'No response'}`);
        }
        await loadClients(); // Refresh the client list
        await loadUserStats(); // Refresh stats after deletion
      } catch (err) {
        alert('Failed to delete client');
        console.error('Error deleting client:', err);
      }
    }
  }

  function handleCreateClientClick() {
    if (userStats && userStats.plan_limits) {
      const maxClients = userStats.plan_limits.max_clients_count;
      const currentClients = userStats.clients_count || 0;
      if (maxClients !== -1 && currentClients >= maxClients) {
        console.log('Client limit reached, navigating to /upgrade');
        navigate('/upgrade');
        return;
      }
    }
    console.log('Creating new client');
    onCreateClient();
  }

  const filteredAndSortedClients = clients
    .filter(client => {
      const matchesSearch = client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' ||
                           (filterStatus === 'active' && (client.total_bookings > 0)) ||
                           (filterStatus === 'inactive' && (client.total_bookings === 0));
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'bookings':
          return (b.total_bookings || 0) - (a.total_bookings || 0);
        case 'spent':
          return (b.total_spent || 0) - (a.total_spent || 0);
        case 'lastBooking':
          return new Date(b.last_booking_date || 0) - new Date(a.last_booking_date || 0);
        default:
          return 0;
      }
    });

  const totalPages = Math.ceil(totalCount / pageSize);

  function handlePageChange(newPage) {
    if (newPage >= 1 && newPage <= totalPages) {
      console.log('Changing page to:', newPage);
      setCurrentPage(newPage);
    }
  }

  function isAtClientLimit() {
    if (!userStats || !userStats.plan_limits) return false;
    const maxClients = userStats.plan_limits.max_clients_count;
    const currentClients = userStats.clients_count || 0;
    return maxClients !== -1 && currentClients >= maxClients;
  }

  function getClientUsageInfo() {
    if (!userStats || !userStats.plan_limits) return { percentage: 0, color: '#10B981', isAtLimit: false };
    const maxClients = userStats.plan_limits.max_clients_count;
    const currentClients = userStats.clients_count || 0;
    if (maxClients === -1) return { percentage: 0, color: '#10B981', isAtLimit: false };
    const percentage = (currentClients / maxClients) * 100;
    const isAtLimit = currentClients >= maxClients;
    let color = '#10B981'; // green
    if (percentage >= 100) color = '#EF4444'; // red
    else if (percentage >= 80) color = '#F59E0B'; // yellow
    return { percentage, color, isAtLimit };
  }

  const formatLimit = (limit) => {
    if (limit === -1) return '∞';
    return limit.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <p className="text-red-800">{error}</p>
        <button 
          onClick={loadClients}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const clientUsage = getClientUsageInfo();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        
        <div className="flex items-center gap-4">
          {userStats && userStats.plan_limits && userStats.plan_limits.max_clients_count !== -1 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                {userStats.clients_count || 0} / {formatLimit(userStats.plan_limits.max_clients_count)} clients
              </span>
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(clientUsage.percentage, 100)}%`,
                    backgroundColor: clientUsage.color,
                  }}
                />
              </div>
            </div>
          )}
          
          <button
            onClick={handleCreateClientClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isAtClientLimit()
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isAtClientLimit() ? (
              <>
                <Zap className="w-4 h-4" />
                Upgrade Plan
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Client
              </>
            )}
          </button>
        </div>
      </div>

      {isAtClientLimit() && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-amber-800 font-medium">Client limit reached</p>
              <p className="text-amber-700 text-sm mt-1">
                You've reached your plan's limit of {formatLimit(userStats.plan_limits.max_clients_count)} clients. 
                <button
                  onClick={() => navigate('/upgrade')}
                  className="underline hover:no-underline ml-1"
                >
                  Upgrade your plan
                </button>
                {' '}to add more clients.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="all">All Clients</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="name">Sort by Name</option>
          <option value="bookings">Sort by Bookings</option>
          <option value="spent">Sort by Amount Spent</option>
          <option value="lastBooking">Sort by Last Booking</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <span className="text-blue-600 font-medium">Total Clients</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            {userStats && userStats.plan_limits && userStats.plan_limits.max_clients_count !== -1 && (
              <span className="text-sm text-gray-500">
                / {formatLimit(userStats.plan_limits.max_clients_count)}
              </span>
            )}
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-green-600 font-medium">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ${clients.reduce((sum, client) => sum + (client.total_spent || 0), 0).toLocaleString()}
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span className="text-purple-600 font-medium">Active Clients</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {clients.filter(c => (c.total_bookings || 0) > 0).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredAndSortedClients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No clients found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Booking</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{client.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">
                              {client.notes && client.notes.length > 50 
                                ? `${client.notes.substring(0, 50)}...` 
                                : client.notes || 'No notes'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{client.email || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{client.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {client.total_bookings || 0} bookings
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(client.total_spent || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {client.last_booking_date ? 
                          new Date(client.last_booking_date).toLocaleDateString() : 
                          'Never'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectClient(client)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditClient(client)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
              <div className="text-sm text-gray-700">
                Showing {filteredAndSortedClients.length} of {totalCount} clients
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClientList;