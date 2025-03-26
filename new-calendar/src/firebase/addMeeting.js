import { db } from "../firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";

// 새로운 모임 추가
export const addMeeting = async (meetingName, selectedDate, startTime, endTime) => {
  try {
    const docRef = await addDoc(collection(db, "meetings"), {
      meetingName,
      selectedDate,
      startTime,
      endTime,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding meeting: ", error);
  }
};
