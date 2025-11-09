type DatePickerProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

const DatePicker: React.FC<DatePickerProps> = ({ label, value, onChange }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = today.toISOString().split('T')[0];

  return (
    <div className="w-full">
      <label className="block mb-1 font-medium text-gray-700">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={minDate}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
      />
    </div>
  );
};

export default DatePicker;
