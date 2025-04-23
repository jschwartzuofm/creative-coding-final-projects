import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Viz1 from "./pages/Viz1";
import Viz2 from "./pages/Viz2";
import Viz3 from "./pages/Viz3";

function App() {
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