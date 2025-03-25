import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, updateDoc, doc, getDoc } from 'firebase/firestore';

export default function Avail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [meetingData, setMeetingData] = useState(null);
  const [availability, setAvailability] = useState({});
  const [groupAvailability, setGroupAvailability] = useState({});
  const [participants, setParticipants] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const meetingId = location.state?.meetingId || searchParams.get('meetingId');
  const participantName = location.state?.participantName || searchParams.get('name');

  useEffect(() => {
    const fetchMeeting = async () => {
      if (meetingId) {
        const docRef = doc(db, 'meetings', meetingId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMeetingData({ id: meetingId, ...docSnap.data() });
        }
      }
    };
    fetchMeeting();
  }, [meetingId]);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (meetingId) {
        const participantsRef = collection(db, `meetings/${meetingId}/participants`);
        const snapshot = await getDocs(participantsRef);
        const participantList = snapshot.docs.map(doc => doc.data().name);
        setParticipants(participantList);
      }
    };
    fetchParticipants();
  }, [meetingId]);

  useEffect(() => {
    const fetchGroupAvailability = async () => {
      if (meetingId) {
        const participantsRef = collection(db, `meetings/${meetingId}/participants`);
        const snapshot = await getDocs(participantsRef);
        const data = snapshot.docs.map(doc => doc.data());

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
    fetchGroupAvailability();
  }, [meetingId]);

  const handleMouseDown = (time) => {
    setIsDragging(true);
    toggleAvailability(time);
  };

  const handleMouseEnter = (time) => {
    if (isDragging) {
      toggleAvailability(time);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleAvailability = (time) => {
    setAvailability((prev) => ({
      ...prev,
      [time]: !prev[time],
    }));
  };

  const handleSubmit = async () => {
    try {
      const participantsRef = collection(db, `meetings/${meetingId}/participants`);
      const q = query(participantsRef, where("name", "==", participantName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          availability: availability,
        });
        navigate('/group-availability', {
          state: { meetingId, ...meetingData },
        });
      } else {
        alert("참가자를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("Error updating availability: ", error);
      alert("시간 저장 중 오류가 발생했습니다.");
    }
  };

  const generateTimeSlots = () => {
    if (!meetingData) return [];
    const { startTime, endTime } = meetingData;
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

  if (!meetingData) return <p className="text-center mt-10 text-gray-500">모임 정보를 불러오는 중...</p>;

  const timeSlots = generateTimeSlots();

  return (
    <div className="flex flex-col items-center p-10" onMouseUp={handleMouseUp}>
      <h1 className="text-2xl font-bold mb-4">가능한 시간 선택</h1>
      <p className="text-lg text-gray-600 mb-6">{meetingData.meetingName} ({meetingData.selectedDate})</p>

      <div className="overflow-x-auto mb-6">
        <table className="table-auto border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 border">시간</th>
              <th className="px-4 py-2 border">{meetingData.selectedDate}</th>
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time) => (
              <tr key={time}>
                <td className="px-4 py-2 border text-sm text-gray-700 text-center">{time}</td>
                <td
                  className={`px-6 py-3 border text-center cursor-pointer select-none transition-all duration-150
                    ${availability[time] ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  onMouseDown={() => handleMouseDown(time)}
                  onMouseEnter={() => handleMouseEnter(time)}
                >
                  {groupAvailability[time] || 0}명 가능
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-semibold mt-6">참가자 목록</h2>
      <ul className="mt-2">
        {participants.map((name, index) => (
          <li key={index} className="text-gray-700">{name}</li>
        ))}
      </ul>

      <button
        onClick={handleSubmit}
        className="px-6 py-2 bg-green-600 text-white rounded-lg mt-4"
      >
        제출
      </button>
    </div>
  );
}
