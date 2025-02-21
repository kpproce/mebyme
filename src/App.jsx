import MyNavbar from "./components/navbar.jsx";
import { useState } from "react";
import { HashRouter } from "react-router-dom"; // Voeg HashRouter toe

import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";

import "./App.css";

function App() {

  // Sla de originele fetch op
const originalFetch = window.fetch;

// Overschrijf fetch om extra logging toe te voegen
window.fetch = async (...args) => {
  console.log('[Fetch Start]', ...args);
  try {
    const response = await originalFetch(...args);
    console.log('[Fetch Success]', response);
    return response;
  } catch (error) {
    console.error('[XXXXX Fetch Error  XXXXX ]', error);
    throw error;
  }
};


  const [darkMode, setDarkMode] = useState(true);
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    const htmlElement = document.querySelector("html");
    htmlElement.setAttribute("data-bs-theme", darkMode ? "dark" : "light");
  };

  return (
    <HashRouter> {/* Wrap je hele applicatie in een HashRouter */}
      <div className={`App ${darkMode ? "theme-dark" : "theme-light"}`}>
        <MyNavbar />
      </div>
    </HashRouter>
  );
}

export default App;
