import { Link } from 'react-router-dom';
import './backButton.css';

const BackButton = () => (
  <Link to='/' className="back-button">← Back</Link>
);

export default BackButton;
