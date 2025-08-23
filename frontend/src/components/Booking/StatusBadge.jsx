const BOOKING_STATUS = {
  CONFIRMED: 'CONFIRMED',
  PENDING: 'PENDING',
  CANCELLED: 'CANCELLED',
};


const StatusBadge = ({ status, isDark }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case BOOKING_STATUS.CONFIRMED:
        return isDark ? 'bg-green-900/20 text-green-400 border-green-700/50' : 'bg-green-50 text-green-600 border-green-200';
      case BOOKING_STATUS.PENDING:
        return isDark ? 'bg-yellow-900/20 text-yellow-400 border-yellow-700/50' : 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case BOOKING_STATUS.CANCELLED:
        return isDark ? 'bg-red-900/20 text-red-400 border-red-700/50' : 'bg-red-50 text-red-600 border-red-200';
      default:
        return isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};

export default StatusBadge;