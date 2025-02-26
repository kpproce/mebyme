import MyNavbar from "./components/navbar.jsx";
import Test_get_images from "./components/Test_get_images.jsx";

import { useState, useCallback} from 'react';
import { HashRouter } from "react-router-dom"; // Voeg HashRouter toe

import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";
import WeatherHistory from "./WeatherHistory.jsx"; // Nieuw toegevoegd feb 2025
import "./App.css";

function App_weather() {
  
  return (
    <>
      <h4>Weatherhistory test app</h4>
      <WeatherHistory/>
    </>
  );
}
export default App_weather;
