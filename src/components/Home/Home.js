import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to the UT 402.001 "Creative Coding" Final Project Archive</h1>
      <div className="grid grid-cols-2 gap-6">
        <Link to="/viz1" className="block border p-4 hover:shadow-lg transition">
          <h2 className="text-xl font-medium">Visualization 1 🏡🏢🌇</h2>
        </Link>
        <Link to="/viz2" className="block border p-4 hover:shadow-lg transition">
          <h2 className="text-xl font-medium">Visualization 2 🚇🚉🚂</h2>
        </Link>
        <Link to="/viz3" className="block border p-4 hover:shadow-lg transition">
          <h2 className="text-xl font-medium">Visualization 3 🌳🌲🌞</h2>
        </Link>
      </div>
    </div>
  );
};

export default Home;
