import React, { useState, useEffect } from "react";

const WeatherHistory = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [city, setCity] = useState(localStorage.getItem("city") || "");
  const [coords, setCoords] = useState(
    JSON.parse(localStorage.getItem("coords")) || { latitude: 51.98, longitude: 5.91111 }
  );

  useEffect(() => {
    if (city) {
      fetchCoordinates(city);
    }
  }, []);

  const fetchCoordinates = async (cityName) => {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const newCoords = {
          latitude: data.results[0].latitude,
          longitude: data.results[0].longitude,
        };
        setCoords(newCoords);
        localStorage.setItem("city", cityName);
        localStorage.setItem("coords", JSON.stringify(newCoords));
      } else {
        setError("Plaats niet gevonden.");
      }
    } catch (err) {
      setError("Fout bij ophalen van coördinaten.");
    }
  };

  const fetchWeatherData = async (date) => {
    setLoading(true);
    setError(null);

    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${coords.latitude}&longitude=${coords.longitude}&start_date=${date}&end_date=${date}&hourly=temperature_2m,relative_humidity_2m`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();

      if (data.hourly && data.hourly.temperature_2m) {
        setWeatherData({
          temperature: data.hourly.temperature_2m,
          humidity: data.hourly.relative_humidity_2m,
        });
      } else {
        setWeatherData(null);
        setError("Geen gegevens beschikbaar voor deze datum.");
      }
    } catch (err) {
      setError("Fout bij ophalen van gegevens.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event) => {
    const date = event.target.value;
    setSelectedDate(date);
    fetchWeatherData(date);
  };

  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  const handleCitySubmit = () => {
    fetchCoordinates(city);
  };

  return (
    <div>
      <h2>Historisch Weer</h2>

      <label>
        Plaatsnaam:{" "}
        <input type="text" value={city} onChange={handleCityChange} />
      </label>
      <button onClick={handleCitySubmit}>Opslaan</button>

      <p>Huidige locatie: <strong>{city}</strong></p>

      <input type="date" value={selectedDate} onChange={handleDateChange} />

      {loading && <p>Gegevens laden...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {weatherData && (
        <div>
          <h3>Weergegevens voor {selectedDate} in {city}</h3>
          <p>Temperatuur (°C): {weatherData.temperature[0]}</p>
          <p>Luchtvochtigheid (%): {weatherData.humidity[0]}</p>
        </div>
      )}
    </div>
  );
};

export default WeatherHistory;
