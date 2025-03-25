import { useLocation } from 'react-router-dom'; 
import { useState, useEffect } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function GroupAvailability() {
  const location = useLocation();
  const { meetingId, selectedDate, meetingName, startTime, endTime } = location.state || {};

  const [groupAvailability, setGroupAvailability] = useState({});
  const [participants, setParticipants] = useState([]);
  const [hoveredTime, setHoveredTime] = useState(null);
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
          Object.entries(participant.availability || {}).forEach(([time, available]) => {
            if (available) {
              aggregatedAvailability[time] = (aggregatedAvailability[time] || 0) + 1;
            }
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
    return slots;
  };

  const renderAvailabilityForHoveredTime = () => {
    if (!hoveredTime) return null;

    return (
      <ul className="mt-2">
        {participantAvailability.map((p, i) => {
          const available = p.availability?.[hoveredTime];
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
      <p className="text-lg text-gray-600 mb-2">{meetingName} ({selectedDate})</p>
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
              <th className="border border-gray-300 px-2 py-1 text-sm">참여자 수</th>
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time) => {
              const count = groupAvailability[time] || 0;
              const bgColor = count >= participants.length ? 'bg-green-700' : count > 0 ? 'bg-green-400' : 'bg-gray-200';
              const textColor = count > 0 ? 'text-white' : 'text-gray-600';
              return (
                <tr
                  key={time}
                  onMouseEnter={() => setHoveredTime(time)}
                  onMouseLeave={() => setHoveredTime(null)}
                >
                  <td className="border border-gray-300 text-center text-sm px-2 py-1">{time}</td>
                  <td className={`border border-gray-300 text-center text-sm px-2 py-1 ${bgColor} ${textColor}`}>
                    {count}명 가능
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hoveredTime && (
        <div className="mb-4 text-center">
          <h2 className="text-xl font-semibold mb-2">{hoveredTime} 시간대 참가자</h2>
          {renderAvailabilityForHoveredTime()}
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
