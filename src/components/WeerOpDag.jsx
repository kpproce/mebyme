import React, { useState, useEffect } from "react";

const WeerOpDag = ({ datum }) => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState(null);
  const [city, setCity] = useState("");

  useEffect(() => {
    const storedCity = localStorage.getItem("city");
    const storedCoords = localStorage.getItem("coords");

    if (storedCity) {
      setCity(storedCity);
    }

    if (storedCoords) {
      try {
        setCoords(JSON.parse(storedCoords));
      } catch (e) {
        console.error("Fout bij het parsen van coords uit localStorage:", e);
        setCoords(null);
      }
    }
  }, []);

  useEffect(() => {
    if (datum && coords) {
      fetchWeatherData();
    }
  }, [datum, coords]);

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);

    if (!coords) {
      return;
    }

    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${coords.latitude}&longitude=${coords.longitude}&start_date=${datum}&end_date=${datum}&daily=temperature_2m_max,precipitation_sum&timezone=Europe/Amsterdam`;

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
          precipitation: data.daily.precipitation_sum[index] || "0.0",
        }));
        setWeatherData(formattedData);
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

  const getTemperatureSymbol = (temperature) => {
    if (temperature < 6) return "❄️";
    if (temperature < 12) return "🌬️";
    if (temperature < 18) return "🌤️";
    if (temperature < 24) return "☀️";
    if (temperature < 28) return "🌞";
    return "🔥";
  };

  const getPrecipitationSymbol = (precipitation) => {
    if (precipitation === "0.0") return " droog";
    if (precipitation < 1) return " miezerig";
    if (precipitation < 2) return "🌦️";
    if (precipitation < 3) return "🌧️💧";
    if (precipitation < 5) return "⛈️💧💧";
    return "🌧️🌧️🌧️";
  };

  if (!city || !coords) {
    return <div>Check plaatsnaam</div>;
  }

  return (
    <>
      {weatherData.length > 0 ? (
        weatherData.map((day, index) => (
          <span key={index}>
            <span>{getTemperatureSymbol(day.temperature)} {day.temperature}°C</span>
            <span>{getPrecipitationSymbol(day.precipitation)} {day.precipitation}mm</span>
          </span>
        ))
      ) : (
        <span> Geen weergegevens</span>
      )}
    </>
  );
};

export default WeerOpDag;
