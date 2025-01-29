import MyNavbar from "./components/navbar.jsx";
import { useState } from "react";
import { HashRouter } from "react-router-dom"; // Voeg HashRouter toe

import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";

import "./App.css";

function App() {
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
