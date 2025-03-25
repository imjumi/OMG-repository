import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SelectDate() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleNext = () => {
    if (selectedDate) {
      navigate('/setup-meeting', { state: { selectedDate } });
    }
  };

  const today = new Date();
  const sixMonthsLater = new Date(today);
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

  const allDates = [];
  let currentDate = new Date(today);
  while (currentDate <= sixMonthsLater) {
    allDates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const datesPerPage = 28;
  const paginatedDates = allDates.slice(page * datesPerPage, (page + 1) * datesPerPage);

  const getMonthLabel = (date) => `${date.getMonth() + 1}월`;

  return (
    <div className="flex flex-col items-center p-10">
      <header className="w-full text-left text-2xl font-bold mb-8 pl-4 text-green-700">
        OurMeetingGuide
      </header>
      <h1 className="text-3xl font-bold mb-10">날짜를 선택하세요</h1>

      <div className="grid grid-cols-7 gap-y-2 gap-x-8 mb-12 text-center text-sm text-gray-600 w-full max-w-3xl">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
          <div key={i} className="text-center">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-8 gap-x-8 mb-12 w-full max-w-3xl">
        {paginatedDates.map((date, i) => {
          const formattedDate = date.toISOString().split('T')[0];
          const isFirstOfMonth = date.getDate() === 1 || i === 0 || date.getMonth() !== paginatedDates[i - 1]?.getMonth();

          return (
            <div key={i} className="flex flex-col items-center relative">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleDateClick(formattedDate)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium transition-colors duration-200
                    ${selectedDate === formattedDate ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {date.getDate()}
                </button>
                {isFirstOfMonth && (
                  <div className="mt-2 text-xs text-green-600 font-semibold">
                    {getMonthLabel(date)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between w-full max-w-3xl mb-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          disabled={page === 0}
          className="px-4 py-2 bg-gray-300 text-white rounded disabled:opacity-50"
        >
          ◀
        </button>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={(page + 1) * datesPerPage >= allDates.length}
          className="px-4 py-2 bg-gray-300 text-white rounded disabled:opacity-50"
        >
          ▶
        </button>
      </div>

      <button
        onClick={handleNext}
        disabled={!selectedDate}
        className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-300"
      >
        만들기
      </button>
    </div>
  );
}
