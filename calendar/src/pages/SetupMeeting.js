import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function SetupMeeting() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedDate = location.state?.selectedDate || "";

  const [meetingName, setMeetingName] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  const handleCreateMeeting = async () => {
    if (!meetingName || !selectedDate) {
      alert("모임 이름과 날짜를 입력해주세요!");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "meetings"), {
        meetingName,
        selectedDate,
        startTime,
        endTime,
        createdAt: Timestamp.now(),
      });

      alert("모임이 생성되었습니다!");

      // ✅ URL 쿼리로 meetingId 전달
      navigate(`/enter-name?meetingId=${docRef.id}`);
    } catch (error) {
      console.error("Error adding meeting: ", error);
      alert("모임 생성 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col items-center p-10">
      <h1 className="text-2xl font-bold mb-4">모임 설정</h1>
      <p className="text-lg text-gray-600 mb-6">선택한 날짜: {selectedDate}</p>
      
      <input
        type="text"
        placeholder="모임 이름 입력"
        value={meetingName}
        onChange={(e) => setMeetingName(e.target.value)}
        className="w-80 px-4 py-2 border rounded-lg mb-4"
      />
      
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-gray-700">시작 시간</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="border px-4 py-2 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-gray-700">종료 시간</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="border px-4 py-2 rounded-lg"
          />
        </div>
      </div>
      
      <button
        onClick={handleCreateMeeting}
        className="px-6 py-2 bg-green-600 text-white rounded-lg"
      >
        모임 만들기
      </button>
    </div>
  );
}
