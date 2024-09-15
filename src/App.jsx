
import MyNavbar from "./components/navbar.jsx";
//import TestComponent from "./components/TestComponent.jsx";
import { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Container} from 'react-bootstrap';

import './App.css'


function App() {

  const [darkMode, setDarkMode] = useState(true);
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    const htmlElement = document.querySelector('html');
    htmlElement.setAttribute('data-bs-theme', 
    darkMode ? 'dark' : 'light');
  };

  return (
    <div className={`App ${darkMode ? 'theme-dark' : 'theme-light'}`}>
    <Container className="py-4">
    < MyNavbar /> 
    {/* <TestComponent/> */}
    </Container>
  </div>


   
  )
}

export default App
