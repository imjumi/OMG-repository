import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

// 모든 모임 목록 가져오기
export const getMeetings = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "meetings"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting meetings: ", error);
  }
};
