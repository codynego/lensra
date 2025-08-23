import {
  Check,
  X,
  Eye,
  Clock,
  Calendar,
  Camera,
  Mail,
  User,
  MapPin,
  Phone,
  DollarSign,
  FileText,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import normalizeTime from '../../utils/dateUtils';

// Enhanced date/time formatting with error handling
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

const BOOKING_STATUS = {
  CONFIRMED: 'CONFIRMED',
  PENDING: 'PENDING',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

const createDateTime = (sessionDate, sessionTime = '00:00:00') => {
  if (!sessionDate) {
    console.warn('createDateTime: No sessionDate provided', { sessionDate, sessionTime });
    return null;
  }
  try {
    let dateStr = sessionDate;
    if (typeof sessionDate === 'object' && sessionDate.getTime) {
      dateStr = sessionDate.toISOString().split('T')[0];
    }
    const normalizedTime = normalizeTime(sessionTime);
    const dateTime = new Date(`${dateStr}T${normalizedTime}`);
    if (isNaN(dateTime.getTime())) {
      console.warn('createDateTime: Invalid Date created', { dateStr, normalizedTime });
      return null;
    }
    return dateTime;
  } catch (error) {
    console.warn('createDateTime: Error creating Date', { sessionDate, sessionTime, error });
    return null;
  }
};

const addHours = (dateTime, hours) => {
  if (!dateTime) {
    console.warn('addHours: No dateTime provided', dateTime);
    return null;
  }
  try {
    const result = new Date(dateTime);
    result.setHours(result.getHours() + hours);
    return result;
  } catch (error) {
    console.warn('addHours: Error adding hours', { dateTime, hours, error });
    return null;
  }
};

const normalizeStatus = (status) => {
  if (!status) return 'PENDING';
  const normalized = status.toString().toLowerCase();
  return (
    Object.values(BOOKING_STATUS).find((s) => s.toLowerCase() === normalized) ||
    (normalized === 'canceled' ? BOOKING_STATUS.CANCELLED : normalized === 'completed' ? BOOKING_STATUS.COMPLETED : status.toString().toUpperCase())
  );
};

const getClientInitials = (clientName) => {
  if (!clientName || typeof clientName !== 'string') return 'NA';
  return clientName
    .trim()
    .split(' ')
    .filter((name) => name.length > 0)
    .map((name) => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

const safeDisplay = (value, fallback = 'N/A') => {
  return value && value.toString().trim() ? value.toString().trim() : fallback;
};

const BookingCard = ({ booking = {}, activeTab = 'all', onView, onAction, isDark = false }) => {
  const {
    id,
    client,
    client_email,
    client_phone,
    session_date,
    session_time,
    service_package,
    location,
    price,
    currency = 'NGN',
    notes,
    status: rawStatus,
    duration = 1,
  } = booking;

  const status = normalizeStatus(rawStatus);
  const sessionDateTime = createDateTime(session_date, normalizeTime(session_time));
  const endDateTime = addHours(sessionDateTime, duration);
  const clientInitials = getClientInitials(client);

  console.log('BookingCard Debug:', {
    id,
    session_date,
    session_time,
    normalizedTime: normalizeTime(session_time),
    sessionDateTime,
    endDateTime,
    formattedDate: sessionDateTime ? formatDate(sessionDateTime) : safeDisplay(session_date),
    formattedTime: sessionDateTime && endDateTime ? `${formatTime(sessionDateTime)} - ${formatTime(endDateTime)}` : safeDisplay(session_time),
  });

  const getStatusStyles = (bookingStatus) => {
    const baseClasses = 'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0';
    switch (bookingStatus) {
      case BOOKING_STATUS.CONFIRMED:
        return `${baseClasses} ${isDark ? 'bg-emerald-900/50 text-emerald-300 border-2 border-emerald-600' : 'bg-emerald-100 text-emerald-700 border-2 border-emerald-400'}`;
      case BOOKING_STATUS.PENDING:
        return `${baseClasses} ${isDark ? 'bg-amber-900/50 text-amber-300 border-2 border-amber-600' : 'bg-amber-100 text-amber-700 border-2 border-amber-400'}`;
      case BOOKING_STATUS.COMPLETED:
        return `${baseClasses} ${isDark ? 'bg-blue-900/50 text-blue-300 border-2 border-blue-600' : 'bg-blue-100 text-blue-700 border-2 border-blue-400'}`;
      case BOOKING_STATUS.CANCELLED:
        return `${baseClasses} ${isDark ? 'bg-red-900/50 text-red-300 border-2 border-red-600' : 'bg-red-100 text-red-700 border-2 border-red-400'}`;
      default:
        return `${baseClasses} ${isDark ? 'bg-gray-900/50 text-gray-300 border-2 border-gray-600' : 'bg-gray-100 text-gray-700 border-2 border-gray-400'}`;
    }
  };

  return (
    <div
      className={`relative rounded-2xl p-6 mb-6 transition-shadow duration-300 hover:shadow-lg overflow-hidden ${
        isDark
          ? 'bg-gray-800/90 border border-gray-700/50'
          : 'bg-white border border-gray-200/50'
      } w-full max-w-xl mx-auto`}
      role="article"
      aria-labelledby={`booking-${id}-title`}
    >
      {/* Status Bar */}
      <div
        className={`absolute top-0 left-0 h-1 w-full rounded-t-2xl ${
          status === BOOKING_STATUS.CONFIRMED
            ? 'bg-emerald-500'
            : status === BOOKING_STATUS.PENDING
            ? 'bg-amber-500'
            : status === BOOKING_STATUS.COMPLETED
            ? 'bg-blue-500'
            : 'bg-red-500'
        }`}
      />

      {/* Header */}
      <div className="flex items-start gap-4 mb-4 mt-2">
        <div className={getStatusStyles(status)}>{clientInitials}</div>
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <h3
            id={`booking-${id}-title`}
            className={`text-lg font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}
            title={safeDisplay(client)}
          >
            {safeDisplay(client, 'Unknown Client')}
          </h3>
          <div className="w-fit">
            <StatusBadge status={status} isDark={isDark} />
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="space-y-2 mb-6">
        {client_email && (
          <div className="flex items-center gap-2 min-w-0">
            <Mail className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-sm truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`} title={client_email}>
              {safeDisplay(client_email)}
            </span>
          </div>
        )}
        {client_phone && (
          <div className="flex items-center gap-2 min-w-0">
            <Phone className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-sm truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{safeDisplay(client_phone)}</span>
          </div>
        )}
      </div>

      {/* Session Details */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2 min-w-0">
            <Calendar className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-sm font-medium truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {sessionDateTime ? formatDate(sessionDateTime) : safeDisplay(session_date)}
            </span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Clock className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-sm truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {sessionDateTime && endDateTime ? `${formatTime(sessionDateTime)} - ${formatTime(endDateTime)}` : safeDisplay(session_time)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {service_package && (
            <div className="flex items-center gap-2 min-w-0">
              <Camera className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm font-medium truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {safeDisplay(service_package)}
              </span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`} title={location}>
                {safeDisplay(location)}
              </span>
            </div>
          )}
          {price && (
            <div className="flex items-center gap-2 min-w-0">
              <DollarSign className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm font-semibold truncate ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                {currency} {safeDisplay(price)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
          <div className="flex items-start gap-2">
            <FileText className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
            <p className={`text-sm break-words ${isDark ? 'text-blue-200' : 'text-blue-700'}`} title={notes}>
              {notes.length > 100 ? `${notes.substring(0, 100)}...` : notes}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            console.log('Selected Booking:', booking);
            onView?.(booking);
          }}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-shadow hover:shadow-md ${
            isDark
              ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50 hover:bg-indigo-600/40'
              : 'bg-indigo-100 text-indigo-700 border border-indigo-300 hover:bg-indigo-200'
          }`}
          aria-label={`View details for ${safeDisplay(client, 'Unknown Client')} booking`}
        >
          <div className="flex items-center justify-center gap-2">
            <Eye className="w-4 h-4" />
            View
          </div>
        </button>

        {activeTab === 'pending' && (
          <>
            <button
              onClick={() => {
                console.log('Approving Booking:', { id });
                onAction?.(id, 'CONFIRMED');
              }}
              className={`p-2.5 rounded-lg transition-shadow hover:shadow-md flex-shrink-0 ${
                isDark
                  ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/50 hover:bg-emerald-600/40'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-200'
              }`}
              aria-label="Approve booking"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                console.log('Rejecting Booking:', { id });
                onAction?.(id, 'CANCELLED');
              }}
              className={`p-2.5 rounded-lg transition-shadow hover:shadow-md flex-shrink-0 ${
                isDark
                  ? 'bg-red-600/30 text-red-200 border border-red-500/50 hover:bg-red-600/40'
                  : 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200'
              }`}
              aria-label="Reject booking"
            >
              <X className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingCard;