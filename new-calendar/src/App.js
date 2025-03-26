import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SelectDate from './pages/SelectDate';
import SetupMeeting from './pages/SetupMeeting';
import EnterName from './pages/EnterName';
import Avail from './pages/Avail';
import GroupAvailability from './pages/GroupAvailability';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SelectDate />} /> {/* ✅ 기본 페이지 설정 */}
        <Route path="/select-date" element={<SelectDate />} />
        <Route path="/setup-meeting" element={<SetupMeeting />} />
        <Route path="/enter-name" element={<EnterName />} />
        <Route path="/avail" element={<Avail />} />
        <Route path="/group-availability" element={<GroupAvailability />} />
      </Routes>
    </Router>
  );
}

export default App;
