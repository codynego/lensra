import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Search,
  Check,
  X,
  Eye,
  Clock,
  User,
  Calendar,
  Camera,
  TrendingUp,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  List,
  Grid,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../AuthContext';
import BookingCard from './BookingCard';
import BookingDetails from './BookingDetails';
import * as dateUtils from '../../utils/dateUtils'; // Correct named imports
import { set } from 'date-fns';

// Constants
const BOOKING_STATUS = {
  confirmed: 'confirmed',
  PENDING: 'PENDING',
  cancelled: 'cancelled',
  COMPLETED: 'COMPLETED',
};

const TAB_CONFIG = {
  upcoming: { label: 'Upcoming', status: BOOKING_STATUS.confirmed },
  pending: { label: 'Pending', status: BOOKING_STATUS.PENDING },
  past: { label: 'Past', status: BOOKING_STATUS.cancelled },
  completed: { label: 'Completed', status: BOOKING_STATUS.COMPLETED },
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Utility functions
const normalizeStatus = (status) => {
  if (!status) return 'UNKNOWN';
  const normalized = status.toString().toLowerCase();
  return (
    Object.values(BOOKING_STATUS).find((s) => s.toLowerCase() === normalized) ||
    (normalized === 'canceled' ? BOOKING_STATUS.cancelled : normalized === 'completed' ? BOOKING_STATUS.COMPLETED : status.toUpperCase())
  );
};

const normalizeTime = (time) => {
  if (!time) {
    console.warn('normalizeTime: No time provided', time);
    return '00:00:00';
  }
  const parts = time.split(':');
  if (parts.length === 2) {
    return `${time}:00`; // Convert HH:mm to HH:mm:ss
  }
  if (parts.length === 3 && parts[2].length === 0) {
    return `${parts[0]}:${parts[1]}:00`; // Handle HH:mm:
  }
  if (parts.length === 1 || !time.includes(':')) {
    console.warn('normalizeTime: Invalid time format', time);
    return '00:00:00';
  }
  return time;
};

const formatDate = (date) => {
  try {
    if (!date) {
      console.warn('formatDate: No date provided', date);
      return 'N/A';
    }
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      console.warn('formatDate: Invalid date', date);
      return 'N/A';
    }
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'Africa/Lagos',
    });
  } catch (error) {
    console.warn('formatDate: Error formatting date', { date, error });
    return 'N/A';
  }
};

const formatTime = (date) => {
  try {
    if (!date) {
      console.warn('formatTime: No date provided', date);
      return 'N/A';
    }
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      console.warn('formatTime: Invalid date', date);
      return 'N/A';
    }
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Lagos',
    });
  } catch (error) {
    console.warn('formatTime: Error formatting time', { date, error });
    return 'N/A';
  }
};


const formatCurrency = (value) => {
  const num = Number(value);
  return isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const ScheduleCalendar = ({ currentMonth, setCurrentMonth, selectedDate, setSelectedDate, bookedDays, isDark }) => {
  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const days = [];

  for (let i = firstDayWeek - 1; i >= 0; i--) {
    const prevDate = new Date(year, month, -i);
    days.push({ date: prevDate, isCurrentMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({ date, isCurrentMonth: true });
  }

  const remainingCells = 42 - days.length;
  for (let day = 1; day <= remainingCells; day++) {
    const nextDate = new Date(year, month + 1, day);
    days.push({ date: nextDate, isCurrentMonth: false });
  }

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const isSelected = (date) => selectedDate.toDateString() === date.toDateString();
  const isToday = (date) => today.toDateString() === date.toDateString();
  const isBooked = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookedDays.includes(dateStr);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateMonth(-1)}
          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {MONTH_NAMES[month]} {year}
        </h4>
        <button
          onClick={() => navigateMonth(1)}
          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className={`text-center text-xs font-medium py-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => day.isCurrentMonth && setSelectedDate(day.date)}
            className={`
              p-2 text-sm rounded-lg transition-all duration-200 relative
              ${day.isCurrentMonth ? (isDark ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100') : isDark ? 'text-gray-600' : 'text-gray-400'}
              ${isSelected(day.date) ? 'bg-indigo-600 text-white' : ''}
              ${isToday(day.date) && !isSelected(day.date) ? (isDark ? 'bg-gray-700' : 'bg-gray-100') : ''}
            `}
          >
            {day.date.getDate()}
            {isBooked(day.date) && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status, isDark }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case BOOKING_STATUS.confirmed:
        return isDark ? 'bg-green-900/20 text-green-400 border-green-700/50' : 'bg-green-50 text-green-600 border-green-200';
      case BOOKING_STATUS.PENDING:
        return isDark ? 'bg-yellow-900/20 text-yellow-400 border-yellow-700/50' : 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case BOOKING_STATUS.cancelled:
        return isDark ? 'bg-red-900/20 text-red-400 border-red-700/50' : 'bg-red-50 text-red-600 border-red-200';
      case BOOKING_STATUS.COMPLETED:
        return isDark ? 'bg-blue-900/20 text-blue-400 border-blue-700/50' : 'bg-blue-50 text-blue-600 border-blue-200';
      default:
        return isDark ? 'bg-gray-900/20 text-gray-400 border-gray-700/50' : 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(status)}`}>{status}</span>
  );
};

// Sub-components
const StatCard = ({ icon: Icon, title, value, bgColor, iconColor, isDark }) => (
  <div
    className={`relative overflow-hidden rounded-2xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm border border-gray-100'} hover:shadow-lg transition-all duration-200`}
  >
    <div className="flex items-center justify-between">
      <div className={`p-3 rounded-xl ${bgColor}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-600'}`}>+10%</div>
    </div>
    <div className="mt-4">
      <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</div>
      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{title}</div>
    </div>
  </div>
);

const ErrorAlert = ({ error, onDismiss, isDark }) => (
  <div className={`rounded-2xl p-8 text-center ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-red-200'}`}>
    <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
      <AlertCircle className={`w-8 h-8 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
    </div>
    <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Something went wrong</h3>
    <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
    {onDismiss && (
      <button
        onClick={onDismiss}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg focus:ring-4 focus:ring-indigo-500/20"
      >
        Try Again
      </button>
    )}
  </div>
);

const LoadingSpinner = ({ isDark }) => (
  <div className="flex items-center justify-center py-12">
    <RefreshCw className={`animate-spin h-8 w-8 ${isDark ? 'text-indigo-400' : 'text-indigo-600'} mr-3`} />
    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading bookings...</span>
  </div>
);

const EmptyState = ({ activeTab, isDark }) => (
  <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'}`}>
    <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
      <Calendar className={`w-10 h-10 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
    </div>
    <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
      No bookings found
    </h3>
    <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
      No {activeTab} bookings at the moment.
    </p>
  </div>
);

const BookingManagement = ({ theme = 'light' }) => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookedDays, setBookedDays] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const debounceTimeout = useRef(null);
  const { apiFetch, isAuthenticated } = useAuth();
  const isDark = theme === 'dark';
  const [currencySymbol, setCurrencySymbol] = useState('');

  const fetchBookings = useCallback(async () => {
    if (!isAuthenticated) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch(`/bookings/bookings/?page=${currentPage}&page_size=${pageSize}&search=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setCurrencySymbol(data[0]?.currency_symbol || '$'); // Default to '$' if not provided

      const results = Array.isArray(data) ? data : Array.isArray(data.results) ? data.results : [];

      const validBookings = results
        .map((booking) => ({
          ...booking,
          status: normalizeStatus(booking.status),
          package_price: Number(booking.package_price) || 0,
          session_time: normalizeTime(booking.session_time),
        }))
        .filter((booking) => booking.session_date && booking.session_time);

      console.log('Valid Bookings:', validBookings);
      setBookings(validBookings);
      setTotalCount(data.count || results.length || 0);

      const uniqueBookedDays = [...new Set(validBookings.map((booking) => booking.session_date))];
      console.log('Booked Days:', uniqueBookedDays);
      setBookedDays(uniqueBookedDays);

      const today = new Date().toISOString().split('T')[0];
      const totalBookings = validBookings.length;
      const pendingBookings = validBookings.filter((b) => b.status === BOOKING_STATUS.PENDING).length;
      const todaysBookings = validBookings.filter((b) => b.session_date === today).length;
      const revenue = validBookings.reduce((sum, b) => sum + (Number(b.package_price) || 0), 0);

      console.log('Calculated Stats:', { totalBookings, pendingBookings, todaysBookings, revenue });
      setStats({ totalBookings, pendingBookings, todaysBookings, revenue });

      if (results.length === 0 && searchTerm) {
        setError('No bookings found for the given search term.');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch bookings';
      setError(errorMessage);
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, isAuthenticated, currentPage, pageSize, searchTerm]);

  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    todaysBookings: 0,
    revenue: 0,
  });

  useEffect(() => {
    fetchBookings();
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [fetchBookings]);

  const handleTabChange = useCallback((tab) => {
    console.log('Active Tab:', tab);
    setActiveTab(tab);
    setSelectedBooking(null);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchTerm(value);
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => {
        setCurrentPage(1);
        fetchBookings();
      }, 300);
    },
    [fetchBookings],
  );

  const handleBookingAction = useCallback(
    async (bookingId, action) => {
      try {
        console.log('Booking Action:', { bookingId, action });
        const response = await apiFetch(`/bookings/bookings/${bookingId}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: action }),
        });

        const responseData = await response.json();
        console.log('Action Response:', responseData);

        if (!response.ok) {
          throw new Error(responseData.message || `Failed to ${action.toLowerCase()} booking`);
        }

        alert(`Booking ${action.toLowerCase()} successfully`);
        await fetchBookings();
        setSelectedBooking(null);
      } catch (err) {
        const errorMessage = err.message || `Failed to ${action.toLowerCase()} booking`;
        setError(errorMessage);
        console.error('Action Error:', err);
        alert(errorMessage);
      }
    },
    [apiFetch, fetchBookings],
  );

  const handlePageChange = useCallback(
    (newPage) => {
      const totalPages = Math.ceil(totalCount / pageSize);
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
      }
    },
    [totalCount, pageSize],
  );

  const filteredBookings = useMemo(() => {
    const tabConfig = TAB_CONFIG[activeTab];
    const bookingsArray = Array.isArray(bookings) ? bookings : [];
    const filtered = bookingsArray
      .filter((booking) => {
        const matchesTab = tabConfig ? normalizeStatus(booking.status) === tabConfig.status : true;
        const matchesSearch =
          booking.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (booking.client_email ? booking.client_email.toLowerCase().includes(searchTerm.toLowerCase()) : true);
        const matchesFilter = filterStatus === 'all' || normalizeStatus(booking.status) === filterStatus;
        console.log('Filtering Booking:', {
          bookingId: booking.id,
          status: booking.status,
          normalizedStatus: normalizeStatus(booking.status),
          matchesTab,
          matchesSearch,
          matchesFilter,
          tabConfigStatus: tabConfig?.status,
          searchTerm,
          filterStatus,
        });
        return matchesTab && matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return new Date(a.session_date || '1970-01-01') - new Date(b.session_date || '1970-01-01');
          case 'price':
            return (Number(b.package_price) || 0) - (Number(a.package_price) || 0);
          case 'client':
            return (a.client || '').localeCompare(b.client || '');
          default:
            return 0;
        }
      });
    console.log('Filtered Bookings:', filtered);
    return filtered;
  }, [bookings, activeTab, searchTerm, filterStatus, sortBy]);

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) {
    return (
      <div className={`min-h-screen p-4 md:p-6 lg:p-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner isDark={isDark} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen p-4 md:p-6 lg:p-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-2xl mx-auto">
          <ErrorAlert error={error} onDismiss={fetchBookings} isDark={isDark} />
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
              Booking Dashboard
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your photography bookings
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
              onClick={fetchBookings}
              disabled={loading}
              className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 ${isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
              aria-label="Refresh bookings"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Calendar,
              title: 'Total Bookings',
              value: stats.totalBookings.toLocaleString(),
              bgColor: isDark ? 'bg-indigo-900/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600',
              iconColor: isDark ? 'text-indigo-400' : 'text-indigo-600',
            },
            {
              icon: Clock,
              title: 'Pending',
              value: stats.pendingBookings.toLocaleString(),
              bgColor: isDark ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-50 text-yellow-600',
              iconColor: isDark ? 'text-yellow-400' : 'text-yellow-600',
            },
            {
              icon: User,
              title: "Today's Bookings",
              value: stats.todaysBookings.toLocaleString(),
              bgColor: isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-600',
              iconColor: isDark ? 'text-green-400' : 'text-green-600',
            },
            {
              icon: TrendingUp,
              title: 'Revenue',
              value: `${currencySymbol}${formatCurrency(stats.revenue)}`,
              bgColor: isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600',
              iconColor: isDark ? 'text-blue-400' : 'text-blue-600',
            },
          ].map((card, index) => (
            <StatCard key={index} {...card} isDark={isDark} />
          ))}
        </div>

        {/* Search and Filters */}
        <div className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search bookings by client name or email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={`pl-12 pr-4 py-3 w-full rounded-lg text-sm font-medium transition-all duration-200 focus:ring-4 ${
                  isDark
                    ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20'
                    : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500/20 shadow-sm'
                }`}
                aria-label="Search bookings"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:ring-4 ${
                  isDark
                    ? 'bg-gray-800 border border-gray-700 text-white focus:border-indigo-500 focus:ring-indigo-500/20'
                    : 'bg-white border border-gray-200 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500/20 shadow-sm'
                }`}
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value={BOOKING_STATUS.confirmed}>confirmed</option>
                <option value={BOOKING_STATUS.PENDING}>Pending</option>
                <option value={BOOKING_STATUS.cancelled}>cancelled</option>
                <option value={BOOKING_STATUS.COMPLETED}>Completed</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:ring-4 ${
                  isDark
                    ? 'bg-gray-800 border border-gray-700 text-white focus:border-indigo-500 focus:ring-indigo-500/20'
                    : 'bg-white border border-gray-200 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500/20 shadow-sm'
                }`}
                aria-label="Sort by"
              >
                <option value="date">Sort by Date</option>
                <option value="price">Sort by Price</option>
                <option value="client">Sort by Client</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bookings List */}
          <div className="lg:col-span-2">
            <div className={`rounded-2xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm border border-gray-100'}`}>
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {Object.entries(TAB_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => handleTabChange(key)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === key
                          ? isDark
                            ? 'border-indigo-500 text-indigo-400'
                            : 'border-indigo-500 text-indigo-600'
                          : isDark
                          ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {config.label}
                      {key === 'pending' && stats.pendingBookings > 0 && (
                        <span
                          className={`ml-2 text-xs font-medium py-0.5 px-2 rounded-full ${
                            isDark ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {stats.pendingBookings}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="p-6">
                {filteredBookings.length === 0 ? (
                  <EmptyState activeTab={activeTab} isDark={isDark} />
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        activeTab={activeTab}
                        onView={setSelectedBooking}
                        onAction={handleBookingAction}
                        isDark={isDark}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      <thead className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <tr>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Client</th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Time</th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Package</th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Price</th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {filteredBookings.map((booking) => {
                          const sessionDateTime = dateUtils.createDateTime(booking.session_date, booking.session_time);
                          const endDateTime = dateUtils.addHours(sessionDateTime, 1);
                          console.log('Table Booking Debug:', {
                            id: booking.id,
                            session_date: booking.session_date,
                            session_time: booking.session_time,
                            sessionDateTime,
                            endDateTime,
                            formattedDate: formatDate(sessionDateTime),
                            formattedTime: `${formatTime(sessionDateTime)} - ${formatTime(endDateTime)}`,
                          });
                          return (
                            <tr key={booking.id}>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {booking.client || 'Unknown Client'}
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate max-w-xs" title={booking.client_email}>
                                {booking.client_email || 'N/A'}
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(sessionDateTime)}</td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {sessionDateTime && endDateTime ? `${formatTime(sessionDateTime)} - ${formatTime(endDateTime)}` : booking.session_time || 'N/A'}
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">{booking.service_package || 'Unknown'}</td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">${formatCurrency(booking.package_price)}</td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                                <StatusBadge status={booking.status} isDark={isDark} />
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      console.log('Selected Booking:', booking);
                                      setSelectedBooking(booking);
                                    }}
                                    className={`text-indigo-600 hover:text-indigo-800 ${isDark ? 'hover:text-indigo-400' : ''}`}
                                    aria-label={`View details for ${booking.client || 'Unknown Client'} booking`}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  {activeTab === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => {
                                          console.log('Approving Booking:', { id: booking.id });
                                          handleBookingAction(booking.id, 'confirmed');
                                        }}
                                        className={`text-green-600 hover:text-green-800 ${isDark ? 'hover:text-green-400' : ''}`}
                                        aria-label="Approve booking"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          console.log('Rejecting Booking:', { id: booking.id });
                                          handleBookingAction(booking.id, 'cancelled');
                                        }}
                                        className={`text-red-600 hover:text-red-800 ${isDark ? 'hover:text-red-400' : ''}`}
                                        aria-label="Reject booking"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                {totalPages > 1 && (
                  <div
                    className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl ${
                      isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
                    }`}
                  >
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
                      <span className="font-medium">{totalCount}</span> bookings
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
                                  : isDark
                                  ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                                  : 'text-gray-600 hover:bg-gray-100'
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
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm border border-gray-100'}`}>
              {selectedBooking && (
                <BookingDetails
                  booking={selectedBooking}
                  onClose={() => setSelectedBooking(null)}
                  onAction={handleBookingAction}
                  isDark={isDark}
                />
              )}
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Schedule Calendar</h3>
              <ScheduleCalendar
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                bookedDays={bookedDays}
                isDark={isDark}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingManagement;