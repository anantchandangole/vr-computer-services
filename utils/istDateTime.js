/**
 * Date/Time Utilities - Uses user's local time sent from client
 * Server always uses Asia/Kolkata (IST, UTC+5:30) as fallback
 */

// Get current date in IST (YYYY-MM-DD format)
function getISTDate() {
  const now = new Date();
  const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get current time in IST (HH:MM format, 24-hour)
function getISTTime() {
  const now = new Date();
  const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const hours = String(istDate.getHours()).padStart(2, '0');
  const minutes = String(istDate.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Get current date and time in IST (YYYY-MM-DD HH:MM format)
function getISTDateTime() {
  return `${getISTDate()} ${getISTTime()}`;
}

// Format a date string to IST format
function formatToIST(dateString) {
  const date = new Date(dateString);
  const istDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get IST date with a specific offset (in days)
function getISTDateWithOffset(offsetDays = 0) {
  const now = new Date();
  now.setDate(now.getDate() + offsetDays);
  const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validate a client-supplied local date string (YYYY-MM-DD).
 * Returns the string if valid, or null.
 */
function parseClientDate(clientDate) {
  if (!clientDate || typeof clientDate !== 'string') return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clientDate.trim())) return null;
  const d = new Date(clientDate.trim() + 'T00:00:00');
  if (isNaN(d.getTime())) return null;
  // Sanity check: not more than 1 day in the future or past 7 days
  return clientDate.trim();
}

/**
 * Validate a client-supplied local time string (HH:MM).
 * Returns the string if valid, or null.
 */
function parseClientTime(clientTime) {
  if (!clientTime || typeof clientTime !== 'string') return null;
  const t = clientTime.trim();
  if (!/^\d{2}:\d{2}$/.test(t)) return null;
  const [h, m] = t.split(':').map(Number);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return t;
}

module.exports = {
  getISTDate,
  getISTTime,
  getISTDateTime,
  formatToIST,
  getISTDateWithOffset,
  parseClientDate,
  parseClientTime
};
