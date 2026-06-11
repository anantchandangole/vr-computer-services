/**
 * India Standard Time (IST) Date/Time Utilities for Client-Side
 * IST = UTC + 5:30
 */

// Get current date in IST (YYYY-MM-DD format)
function getISTDateClient() {
  const now = new Date();
  const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const date = String(istDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
}

// Get current time in IST (HH:MM format, 24-hour)
function getISTTimeClient() {
  const now = new Date();
  const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const hours = String(istDate.getHours()).padStart(2, '0');
  const minutes = String(istDate.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Get current date and time in IST (YYYY-MM-DD HH:MM format)
function getISTDateTimeClient() {
  return `${getISTDateClient()} ${getISTTimeClient()}`;
}

// Format a time string for display (HH:MM format)
function formatTimeDisplay(time) {
  if (!time) return '-';
  // Ensure time is in HH:MM format
  if (typeof time === 'string' && time.includes(':')) {
    return time;
  }
  return time;
}

// Format a date string for display (YYYY-MM-DD format)
function formatDateDisplay(dateStr) {
  if (!dateStr) return '-';
  return dateStr;
}

// Format IST current timestamp for display
function formatCurrentISTTime() {
  const now = new Date();
  const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return istDate.toLocaleString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-');
}
