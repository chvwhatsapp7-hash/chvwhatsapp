import './App.css';
import { Routes, Route } from 'react-router-dom';
import  UserRegister  from './UserRegister/UserRegister.jsx';

function App() {
  return (
    <>
      <Routes>
        {/* ✅ Wrap the component in JSX */}
        <Route path="/" element={<UserRegister />} />
      </Routes>
    </>
  );
}

export default App;
