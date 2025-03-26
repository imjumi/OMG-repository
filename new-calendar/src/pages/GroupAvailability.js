import { useLocation } from 'react-router-dom'; 
import { useState, useEffect } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function GroupAvailability() {
  const location = useLocation();
  const { meetingId, selectedDates, meetingName, startTime, endTime } = location.state || {};

  const [groupAvailability, setGroupAvailability] = useState({});
  const [participants, setParticipants] = useState([]);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [participantAvailability, setParticipantAvailability] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (meetingId) {
        const snapshot = await getDocs(collection(db, `meetings/${meetingId}/participants`));
        const data = snapshot.docs.map(doc => doc.data());
        setParticipantAvailability(data);
        setParticipants(data.map(p => p.name));

        const aggregatedAvailability = {};
        data.forEach(participant => {
          Object.entries(participant.availability || {}).forEach(([date, times]) => {
            times.forEach(time => {
              const key = `${date}_${time}`;
              aggregatedAvailability[key] = (aggregatedAvailability[key] || 0) + 1;
            });
          });
        });
        setGroupAvailability(aggregatedAvailability);
      }
    };
    fetchParticipants();
  }, [meetingId]);

  const generateTimeSlots = () => {
    const slots = [];
    let currentTime = startTime;
    while (currentTime < endTime) {
      slots.push(currentTime);
      let [hours, minutes] = currentTime.split(':').map(Number);
      minutes += 30;
      if (minutes >= 60) {
        hours += 1;
        minutes = 0;
      }
      currentTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    // 종료 시간도 포함되도록 추가
    if (currentTime === endTime) {
      slots.push(currentTime);
    }
    return slots;
  };

  const renderAvailabilityForHovered = () => {
    if (!hoveredCell) return null;
    const [date, time] = hoveredCell.split('_');
    return (
      <ul className="mt-2">
        {participantAvailability.map((p, i) => {
          const available = (p.availability?.[date] || []).includes(time);
          return (
            <li key={i} className={`text-sm ${available ? 'font-semibold text-green-700' : 'text-gray-400'}`}>
              {available ? p.name : `- ${p.name}`}
            </li>
          );
        })}
      </ul>
    );
  };

  const shareableLink = `${window.location.origin}/enter-name?meetingId=${meetingId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="flex flex-col items-center p-10">
      <h1 className="text-2xl font-bold mb-4">그룹 전체 가능 시간</h1>
      <p className="text-lg text-gray-600 mb-2">{meetingName}</p>
      <button
        onClick={handleCopyLink}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        링크 복사하기
      </button>
      {copied && <p className="text-green-600 mb-4">링크가 복사되었습니다!</p>}

      <div className="overflow-x-auto mb-6">
        <table className="table-fixed border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-2 py-1 w-20">시간</th>
              {selectedDates?.map(date => (
                <th key={date} className="border border-gray-300 px-2 py-1 text-sm">{date}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time) => (
              <tr key={time}>
                <td className="border border-gray-300 text-center text-sm px-2 py-1">{time}</td>
                {selectedDates?.map(date => {
                  const key = `${date}_${time}`;
                  const count = groupAvailability[key] || 0;
                  const bgColor = count >= participants.length ? 'bg-green-700' : count > 0 ? 'bg-green-400' : 'bg-gray-200';
                  const textColor = count > 0 ? 'text-white' : 'text-gray-600';
                  return (
                    <td
                      key={key}
                      className={`border border-gray-300 text-center text-sm px-2 py-1 cursor-pointer ${bgColor} ${textColor}`}
                      onMouseEnter={() => setHoveredCell(key)}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {count}명 가능
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hoveredCell && (
        <div className="mb-4 text-center">
          <h2 className="text-xl font-semibold mb-2">{hoveredCell.replace('_', ' ')} 시간대 참가자</h2>
          {renderAvailabilityForHovered()}
        </div>
      )}

      <h2 className="text-xl font-semibold mt-6">참가자 목록</h2>
      <ul className="mt-2">
        {participants.map((name, index) => (
          <li key={index} className="text-gray-700">{name}</li>
        ))}
      </ul>
    </div>
  );
}
