import MyNavbar from "./components/navbar.jsx";
import Test_get_images from "./components/Test_get_images.jsx";

import { useState, useCallback} from 'react';
import { HashRouter } from "react-router-dom"; // Voeg HashRouter toe

import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";

import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [aspect, setAspect] = useState("benauwd");

  // Toggle theme function
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    const htmlElement = document.querySelector("html");
    htmlElement.setAttribute("data-bs-theme", darkMode ? "dark" : "light");
  };

  // Handle change for select dropdown
  const handleChange = (event) => {
    setAspect(event.target.value); // Update aspect based on selected option
  };

  return (
    <>
      <h2>Test Get Images</h2>
      {/* Dropdown for selecting aspect */}
      <select
        id="aspectSelectMain"
        value={aspect} // Synchronize select with the current value of `aspect`
        onChange={handleChange} // Update aspect on selection
      >
        <option value="benauwd">Benauwd</option>
        <option value="lopen">Lopen</option>
        <option value="prednison">Prednison</option>
      </select>

      {/* Render Test_get_images component */}
      <Test_get_images
        aspect={aspect} // Pass the selected aspect as prop
        aspect_type={"welzijn"}
      />
    </>
  );
}
export default App;
