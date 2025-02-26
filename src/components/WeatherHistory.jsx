import React, { useState, useEffect } from "react";

const WeatherHistory = ({ aantalDagen }) => {
  const [selectedDate, setSelectedDate] = useState(getYesterday());
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [city, setCity] = useState(localStorage.getItem("city") || "");
  const [coords, setCoords] = useState(JSON.parse(localStorage.getItem("coords")) || null);
  const [cityError, setCityError] = useState(false);

  useEffect(() => {
    if (coords) {
      fetchWeatherData(selectedDate);
    }
  }, [coords, selectedDate]);

  function getYesterday() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split("T")[0];
  }

  function formatDateString(dateString) {
    const days = ["zo", "ma", "di", "wo", "do", "vr", "za"];
    const months = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

    const date = new Date(dateString);
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
  }

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

        setCityError(false);
      } else {
        setCityError(true);
      }
    } catch (err) {
      setCityError(true);
    }
  };

  const fetchWeatherData = async (date) => {
    if (!coords) {
      return;
    }

    setLoading(true);
    setError(null);

    const vanafDatum = new Date(date);
    vanafDatum.setDate(vanafDatum.getDate() - (aantalDagen - 1));
    const pastDate = vanafDatum.toISOString().split("T")[0];

    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${coords.latitude}&longitude=${coords.longitude}&start_date=${pastDate}&end_date=${date}&daily=temperature_2m_max,relative_humidity_2m_mean,precipitation_sum&timezone=Europe/Amsterdam`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();

      if (data.daily && data.daily.time) {
        const formattedData = data.daily.time.map((time, index) => ({
          date: time,
          temperature: data.daily.temperature_2m_max[index] || "n.v.t.",
          humidity: data.daily.relative_humidity_2m_mean[index] || "n.v.t.",
          precipitation: data.daily.precipitation_sum[index] || "0.0",
        }));

        setWeatherData(formattedData.reverse()); // Omgekeerde volgorde
      } else {
        setWeatherData([]);
        setError("Geen gegevens beschikbaar.");
      }
    } catch (err) {
      setWeatherData([]);
      setError("Fout bij ophalen van gegevens.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  const handleCitySubmit = () => {
    fetchCoordinates(city);
  };

  const getTemperatureSymbol = (temperature) => {
    if (temperature < 5) return "❄️";
    if (temperature < 10) return "🌬️";
    if (temperature < 15) return "🌤️";
    if (temperature < 20) return "☀️";
    if (temperature < 25) return "🌞";
    return "🔥";
  };

  const getHumiditySymbol = (humidity) => {
    if (humidity < 20) return "🌵";
    if (humidity < 40) return "🍂";
    if (humidity < 60) return "🌤️";
    if (humidity < 80) return "💧";
    return "🌧️";
  };

  const getPrecipitationSymbol = (precipitation) => {
    if (precipitation === "0.0") return "☁️🌞";
    if (precipitation < 1) return "🌫️";
    if (precipitation < 2) return "🌦️";
    if (precipitation < 3) return "🌧️";
    if (precipitation < 5) return "⛈️💧";
    return "🌧️🌧️🌧️";
  };

  return (
    <div>
      <h2>Historisch Weer</h2>

      <label>
        Plaatsnaam:{" "}
        <input
          type="text"
          value={city}
          onChange={handleCityChange}
          placeholder="Voer plaatsnaam in"
          style={{ borderColor: cityError ? "red" : "black" }}
        />
        {!cityError && coords && (
          <small> ({coords.latitude.toFixed(2)}, {coords.longitude.toFixed(2)})</small>
        )}
      </label>
      <button onClick={handleCitySubmit}>Opslaan</button>

      <p>Huidige locatie: <strong>{city}</strong></p>

      <label>
        Selecteer datum:{" "}
        <input type="date" value={selectedDate} onChange={handleDateChange} />
      </label>

      {loading && <p>Gegevens laden...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {weatherData.length > 0 && (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Temperatuur (°C)</th>
              <th>Luchtvochtigheid (%)</th>
              <th>Neerslag (mm)</th>
            </tr>
          </thead>
          <tbody>
            {weatherData.map((day, index) => (
              <tr key={index}>
                <td>{formatDateString(day.date)}</td>
                <td>{getTemperatureSymbol(day.temperature)} {day.temperature}</td>
                <td>{getHumiditySymbol(day.humidity)} {day.humidity}</td>
                <td>{getPrecipitationSymbol(day.precipitation)} {day.precipitation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default WeatherHistory;

