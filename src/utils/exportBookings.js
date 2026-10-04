/**
 * Exports the user's booking history as a downloadable CSV file.
 * Pure client-side (Blob + object URL) — no backend required.
 */
export function exportBookingsToCSV(bookings, userName = 'Rider') {
  if (!bookings || bookings.length === 0) return;

  const headers = ['Booking ID', 'Mode', 'Trip', 'Status', 'Fare (₹)', 'Payment Method', 'Booked At'];

  const escapeCell = (value) => {
    const str = String(value ?? '');
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const rows = bookings.map((b) => [
    b.id,
    b.mode,
    b.title,
    b.status,
    b.fare,
    b.paymentMethodName || b.paymentMethod,
    b.createdAt || b.scheduledTime
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCell).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `rideflow_booking_history_${userName.replace(/\s+/g, '_').toLowerCase()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
