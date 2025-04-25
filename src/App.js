import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home, Viz1, Viz2, Viz3, Viz4 } from './components';
import { Text } from '@chakra-ui/react';

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/viz1" element={<Viz1 />} />
          <Route path="/viz2" element={<Viz2 />} />
          <Route path="/viz3" element={<Viz3 />} />
          <Route path="/viz4" element={<Viz4 />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
