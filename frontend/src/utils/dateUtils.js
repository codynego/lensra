

function addHours(dateTime, hours) {
    if (!dateTime || typeof hours !== 'number') return null;
    
    const result = new Date(dateTime);
    if (isNaN(result.getTime())) return null;
    
    result.setHours(result.getHours() + hours);
    return result;
}


function normalizeTime(time) {
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

function createDateTime(sessionDate, sessionTime = '00:00:00') {
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

export { createDateTime, addHours };
export default addHours;