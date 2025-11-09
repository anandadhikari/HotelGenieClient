export const validateDates = (startDate: string, endDate: string): string | null => {
  if (!startDate || !endDate) {
    return 'Please select check-in and check-out dates.';
  }

  const selectedStartDate = new Date(startDate);
  const selectedEndDate = new Date(endDate);
  const today = new Date();

  selectedStartDate.setHours(0, 0, 0, 0);
  selectedEndDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (selectedStartDate < today || selectedEndDate < today) {
    return 'Dates cannot be in the past. Please choose valid dates.';
  }

  if (selectedStartDate >= selectedEndDate) {
    return 'Check-in date must be earlier than the check-out date.';
  }

  return null;
};

export const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};