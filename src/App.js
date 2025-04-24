import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home, Viz1, Viz2, Viz3 } from './components';

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/viz1" element={<Viz1 />} />
          <Route path="/viz2" element={<Viz2 />} />
          <Route path="/viz3" element={<Viz3 />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
