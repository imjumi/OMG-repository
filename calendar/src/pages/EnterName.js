import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function EnterName() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const meetingId = searchParams.get('meetingId');

  const [meetingInfo, setMeetingInfo] = useState(null);
  const [participantName, setParticipantName] = useState("");

  useEffect(() => {
    const fetchMeeting = async () => {
      if (meetingId) {
        const meetingRef = doc(db, 'meetings', meetingId);
        const meetingSnap = await getDoc(meetingRef);
        if (meetingSnap.exists()) {
          setMeetingInfo({ id: meetingId, ...meetingSnap.data() });
        }
      }
    };
    fetchMeeting();
  }, [meetingId]);

  const handleJoinMeeting = async () => {
    if (!participantName || !meetingInfo) return;

    await addDoc(collection(db, `meetings/${meetingId}/participants`), {
      name: participantName,
      availability: {},
      joinedAt: Timestamp.now(),
    });

    navigate(`/avail?meetingId=${meetingId}&name=${encodeURIComponent(participantName)}`, {
      state: {
        meetingId,
        meetingName: meetingInfo.meetingName,
        selectedDate: meetingInfo.selectedDate,
        startTime: meetingInfo.startTime,
        endTime: meetingInfo.endTime,
        participantName,
      },
    });
  };

  if (!meetingInfo) {
    return <p className="text-center mt-10 text-gray-500">모임 정보를 불러오는 중...</p>;
  }

  return (
    <div className="flex flex-col items-center p-10">
      <h1 className="text-2xl font-bold mb-4">참가자 이름 입력</h1>
      <p className="text-lg text-gray-600 mb-6">{meetingInfo.meetingName} ({meetingInfo.selectedDate})</p>
      <input
        type="text"
        placeholder="이름 입력"
        value={participantName}
        onChange={(e) => setParticipantName(e.target.value)}
        className="w-80 px-4 py-2 border rounded-lg mb-4"
      />
      <button
        onClick={handleJoinMeeting}
        className="px-6 py-2 bg-green-600 text-white rounded-lg"
      >
        참가하기
      </button>
    </div>
  );
}
