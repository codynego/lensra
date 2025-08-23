import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  DollarSign,
  Users,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  SortAsc,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Activity,
  Star,
  X,
  Menu,
  List,
  Grid
} from 'lucide-react';
import { useAuth } from '../../AuthContext';

// Utility function for currency formatting
const formatCurrency = (value) => {
  const num = Number(value);
  return isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const ClientList = ({ onSelectClient, onCreateClient, onEditClient, theme = 'light' }) => {
  // Assume these are passed as props or from context
  const { apiFetch, authState } = useAuth();


  const apiFetchRef = useRef(apiFetch);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const debounceTimeout = useRef(null);

  // Update apiFetchRef
  useEffect(() => {
    apiFetchRef.current = apiFetch;
  }, [apiFetch]);

  // Fetch clients
  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetchRef.current(
        `/photographers/clients/?page=${currentPage}&page_size=${pageSize}&search=${encodeURIComponent(searchTerm)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to load clients: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('API Response (loadClients):', data); // Debug: Log raw API response
      const normalizedClients = data.results.map(client => ({
        ...client,
        total_bookings: Number(client.total_bookings) || 0,
        total_spent: Number(client.total_spent) || 0,
        last_booking_date: client.last_booking_date || null,
      }));
      console.log('Normalized Clients:', normalizedClients); // Debug: Log processed clients
      setClients(normalizedClients);
      setTotalCount(data.count || 0);
    } catch (err) {
      setError('Failed to load clients');
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm]);

  // Load clients on mount, pagination, or search change
  useEffect(() => {
    if (authState.isAuthenticated) {
      loadClients();
    } else {
      setLoading(false);
    }
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [authState.isAuthenticated, loadClients]);

  // Debounced search handler
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setCurrentPage(1);
      loadClients();
    }, 300);
  }, [loadClients]);

  // Delete client
  const handleDeleteClient = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      try {
        const response = await apiFetchRef.current(`/photographers/clients/${id}/`, {
          method: 'DELETE',
        });
        console.log('Delete Client Response:', response); // Debug: Log response
        if (!response.ok) {
          throw new Error(`Failed to delete client: ${response.status} ${response.statusText}`);
        }
        await loadClients();
      } catch (err) {
        setError('Failed to delete client');
        console.error('Error deleting client:', err);
        alert('Failed to delete client');
      }
    }
  }, [loadClients]);

  // Pagination
  const handlePageChange = useCallback((newPage) => {
    const totalPages = Math.ceil(totalCount / pageSize);
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }, [totalCount, pageSize]);

  // Memoized filtered and sorted clients
  const filteredAndSortedClients = useMemo(() => {
    const filtered = clients
      .filter(client => {
        const matchesSearch = client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             client.phone?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' ||
                             (filterStatus === 'active' && (client.total_bookings || 0) > 0) ||
                             (filterStatus === 'inactive' && (client.total_bookings || 0) === 0);
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
            return new Date(b.last_booking_date || '1970-01-01') - new Date(a.last_booking_date || '1970-01-01');
          default:
            return 0;
        }
      });
    console.log('Filtered and Sorted Clients:', filtered); // Debug: Log filtered clients
    return filtered;
  }, [clients, searchTerm, filterStatus, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalRevenue = clients.reduce((sum, client) => sum + (Number(client.total_spent) || 0), 0);
    const activeClients = clients.filter(c => (c.total_bookings || 0) > 0).length;
    const avgRevenuePerClient = clients.length > 0 ? totalRevenue / clients.length : 0;

    console.log('Stats:', { totalClients: totalCount, totalRevenue, activeClients, avgRevenuePerClient }); // Debug: Log stats
    return {
      totalClients: totalCount,
      totalRevenue,
      activeClients,
      avgRevenuePerClient,
    };
  }, [clients, totalCount]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const isDark = theme === 'dark';

  // Loading state
  if (authState.loading || loading) {
    return (
      <div className={`min-h-screen p-4 md:p-6 lg:p-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="flex justify-between items-center">
              <div className={`h-8 w-32 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
              <div className={`h-10 w-32 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`h-24 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}></div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className={`h-12 flex-1 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}></div>
              <div className={`h-12 w-32 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`h-48 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen p-4 md:p-6 lg:p-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-2xl mx-auto">
          <div className={`rounded-2xl p-8 text-center ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-red-200'}`}>
            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
              <X className={`w-8 h-8 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Something went wrong</h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
            <button
              onClick={loadClients}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg focus:ring-4 focus:ring-indigo-500/20"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-6 lg:p-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={`text-2xl md:text-3xl lg:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Clients
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your client relationships and bookings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm border border-gray-200'
              }`}
              aria-label="Toggle filters"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm border border-gray-200'
              }`}
              aria-label={`Switch to ${viewMode === 'grid' ? 'table' : 'grid'} view`}
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              {viewMode === 'grid' ? 'Table' : 'Grid'}
            </button>
            <button
              onClick={onCreateClient}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-4 focus:ring-indigo-500/20"
              aria-label="Add new client"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Client</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Users,
              label: 'Total Clients',
              value: stats.totalClients.toLocaleString(),
              change: '+12%',
              trend: 'up',
              color: 'indigo',
            },
            {
              icon: DollarSign,
              label: 'Total Revenue',
              value: `$${formatCurrency(stats.totalRevenue)}`,
              change: '+18%',
              trend: 'up',
              color: 'green',
            },
            {
              icon: Activity,
              label: 'Active Clients',
              value: stats.activeClients.toLocaleString(),
              change: '+5%',
              trend: 'up',
              color: 'blue',
            },
            {
              icon: TrendingUp,
              label: 'Avg per Client',
              value: `$${formatCurrency(stats.avgRevenuePerClient)}`,
              change: '+8%',
              trend: 'up',
              color: 'purple',
            },
          ].map((stat, i) => (
            <div key={i} className={`relative overflow-hidden rounded-2xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm border border-gray-100'} hover:shadow-lg transition-all duration-200`}>
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${
                  stat.color === 'indigo' ? (isDark ? 'bg-indigo-900/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600') :
                  stat.color === 'green' ? (isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-600') :
                  stat.color === 'blue' ? (isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600') :
                  (isDark ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-50 text-purple-600')
                }`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-600'}`}>
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search clients by name, email, or phone..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={`pl-12 pr-4 py-3 w-full rounded-lg text-sm font-medium transition-all duration-200 focus:ring-4 ${
                  isDark ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20' : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500/20 shadow-sm'
                }`}
                aria-label="Search clients"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:ring-4 ${
                  isDark ? 'bg-gray-800 border border-gray-700 text-white focus:border-indigo-500 focus:ring-indigo-500/20' : 'bg-white border border-gray-200 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500/20 shadow-sm'
                }`}
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:ring-4 ${
                  isDark ? 'bg-gray-800 border border-gray-700 text-white focus:border-indigo-500 focus:ring-indigo-500/20' : 'bg-white border border-gray-200 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500/20 shadow-sm'
                }`}
                aria-label="Sort by"
              >
                <option value="name">Sort by Name</option>
                <option value="bookings">Sort by Bookings</option>
                <option value="spent">Sort by Revenue</option>
                <option value="lastBooking">Sort by Last Booking</option>
              </select>
            </div>
          </div>
        </div>

        {/* Client Content */}
        {filteredAndSortedClients.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'}`}>
            <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Users className={`w-10 h-10 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No clients found
            </h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filter criteria.' : 'Get started by adding your first client.'}
            </p>
            {(!searchTerm && filterStatus === 'all') && (
              <button
                onClick={onCreateClient}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg focus:ring-4 focus:ring-indigo-500/20"
                aria-label="Add first client"
              >
                Add Your First Client
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedClients.map((client) => (
                  <div
                    key={client.id}
                    className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02] ${
                      isDark ? 'bg-gray-800 border border-gray-700 hover:bg-gray-750 hover:shadow-2xl' : 'bg-white shadow-sm hover:shadow-xl border border-gray-100'
                    }`}
                    role="article"
                    aria-labelledby={`client-${client.id}-name`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg ${
                        client.total_bookings > 5 ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white' :
                        client.total_bookings > 0 ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' :
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {client.name ? client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'NA'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 id={`client-${client.id}-name`} className={`font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {client.name || 'Unnamed Client'}
                          </h3>
                          {client.total_bookings > 5 && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" aria-label="VIP Client" />
                          )}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {client.total_bookings || 0} booking{(client.total_bookings || 0) !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      {client.email && (
                        <div className="flex items-center gap-3">
                          <Mail className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span className={`text-sm truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`} title={client.email}>
                            {client.email}
                          </span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {client.phone}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className={`text-center p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ${formatCurrency(client.total_spent)}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Total Spent
                        </div>
                      </div>
                      <div className={`text-center p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {client.last_booking_date && new Date(client.last_booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Africa/Lagos' })}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Last Booking
                        </div>
                      </div>
                    </div>
                    {client.notes && (
                      <div className={`text-sm mb-4 p-3 rounded-xl ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                        <p className={`line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} title={client.notes}>
                          {client.notes}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          console.log('Selected Client:', client); // Debug: Log selected client
                          onSelectClient(client);
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isDark ? 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                        }`}
                        aria-label={`View details for ${client.name || 'Unnamed Client'}`}
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => {
                          console.log('Editing Client:', client); // Debug: Log editing client
                          onEditClient(client);
                        }}
                        className={`p-2.5 rounded-lg transition-all duration-200 ${
                          isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        aria-label={`Edit ${client.name || 'Unnamed Client'}`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className={`p-2.5 rounded-lg transition-all duration-200 ${
                          isDark ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                        aria-label={`Delete ${client.name || 'Unnamed Client'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <thead className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Phone</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Bookings</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Total Spent</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Last Booking</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {filteredAndSortedClients.map((client) => (
                      <tr key={client.id}>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {client.name || 'Unnamed Client'}
                            </span>
                            {client.total_bookings > 5 && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" aria-label="VIP Client" />
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate max-w-xs" title={client.email}>
                          {client.email || 'N/A'}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {client.phone || 'N/A'}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {client.total_bookings || 0}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          ${formatCurrency(client.total_spent)}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {client.last_booking_date && new Date(client.last_booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Africa/Lagos' })}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                console.log('Selected Client:', client); // Debug: Log selected client
                                onSelectClient(client);
                              }}
                              className={`text-indigo-600 hover:text-indigo-800 ${isDark ? 'hover:text-indigo-400' : ''}`}
                              aria-label={`View details for ${client.name || 'Unnamed Client'}`}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                console.log('Editing Client:', client); // Debug: Log editing client
                                onEditClient(client);
                              }}
                              className={`text-gray-600 hover:text-gray-800 ${isDark ? 'text-gray-300 hover:text-gray-100' : ''}`}
                              aria-label={`Edit ${client.name || 'Unnamed Client'}`}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClient(client.id)}
                              className={`text-red-600 hover:text-red-800 ${isDark ? 'text-red-400 hover:text-red-300' : ''}`}
                              aria-label={`Delete ${client.name || 'Unnamed Client'}`}
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
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
                  <span className="font-medium">{totalCount}</span> clients
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:hover:bg-gray-100'
                    }`}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            currentPage === pageNum
                              ? 'bg-indigo-600 text-white shadow-lg'
                              : isDark ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-300' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                          aria-label={`Go to page ${pageNum}`}
                          aria-current={currentPage === pageNum ? 'page' : undefined}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:hover:bg-gray-100'
                    }`}
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClientList;