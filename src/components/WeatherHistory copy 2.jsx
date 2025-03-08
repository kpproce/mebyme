import React, { useState, useEffect } from "react";

const WeatherCalendar = ({ yearMonth }) => {
  // Haal city en coords uit localStorage
  const [city, setCity] = useState(localStorage.getItem("city") || "");
  const [coords, setCoords] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("coords"));
    } catch {
      return null;
    }
  });
  const [inputCity, setInputCity] = useState("");
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Voor modal met details van een dag
  const [selectedDayData, setSelectedDayData] = useState(null);

  // Bepaal de start- en einddatum van de maand,
  const endDateObj = new Date(yearMonth + "-01");
  endDateObj.setMonth(endDateObj.getMonth() + 1);
  endDateObj.setDate(endDateObj.getDate() - 1);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const adjustedEndDate = endDateObj > yesterday ? yesterday : endDateObj; // de einddatum moet voor vandaag liggen, ivm ophalen weergegevens
  const startDate = `${yearMonth}-01`;
  const endDate = adjustedEndDate.toISOString().split("T")[0];

  // Als er een city is maar nog geen coords, haal dan de coördinaten op
  useEffect(() => {
    if (city && !coords) {
      fetchCoordinates(city);
    }
  }, [city, coords]);

  // Als coords beschikbaar zijn, haal weerdata op voor de opgegeven maand
  useEffect(() => {
    if (coords && coords.latitude && coords.longitude) {
      fetchWeatherData();
    }
  }, [coords, yearMonth]);

  // Haal coördinaten op via de geocoding API en sla deze op in state en localStorage
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
        localStorage.setItem("coords", JSON.stringify(newCoords));
        setCity(cityName);
        localStorage.setItem("city", cityName);
        setError(null);
      } else {
        setError("Geen coördinaten gevonden voor de stad.");
      }
    } catch (err) {
      setError("Fout bij ophalen van coördinaten.");
    }
  };

  // Haal weerdata op via de archive API voor de opgegeven maand (yearMonth)
  // Extra daily parameters: relative_humidity_2m_mean, precipitation_sum
  const fetchWeatherData = async () => {
    if (!coords) return;
    setLoading(true);
    setError(null);

    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${coords.latitude}&longitude=${coords.longitude}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,relative_humidity_2m_mean,precipitation_sum&timezone=Europe/Amsterdam`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();

      if (data.daily && data.daily.time) {
        setWeatherData(
          data.daily.time.map((time, index) => ({
            date: time,
            temperature: data.daily.temperature_2m_max[index] ?? "n.v.t.",
            humidity: data.daily.relative_humidity_2m_mean[index] ?? "n.v.t.",
            precipitation: data.daily.precipitation_sum[index] ?? "n.v.t.",
          }))
        );
      } else {
        setWeatherData([]);
        setError("Geen weergegevens beschikbaar.");
      }
    } catch (err) {
      setWeatherData([]);
      setError("Fout bij ophalen van weergegevens.");
    } finally {
      setLoading(false);
    }
  };

  // Retourneer een weericoon op basis van de temperatuur
  const getTemperatureSymbol = (temperature) => {
    if (typeof temperature !== "number") return "";
    if (temperature < 1) return "☃️";
    if (temperature < 10) return "❄️";
    if (temperature < 15) return "☁️";
    if (temperature < 22) return "🌞";
    if (temperature < 29) return "🌞🌞";
    return "🔥";
  };

  const getTemperatureColor = (temperature) => {
    if (typeof temperature !== "number") return "";
    if (temperature < -7) return "#42d4f5";
    if (temperature >= -7 && temperature < 0)  return "#42f5c5";
    if (temperature >= 0  && temperature < 7)  return "#b8d65e";
    if (temperature >= 7  && temperature < 14) return "#e0cb63";
    if (temperature >= 14 && temperature < 21) return "#a8e053";
    if (temperature >= 21 && temperature < 28) return "#e0bf53";
    if (temperature >= 28 && temperature < 35) return "#e09c53";
    return "🔥";
  };

  // Kalenderweergave: bereken offset voor de eerste dag (maandag als start)
  const firstOfMonth = new Date(yearMonth + "-01");
  const offset = (firstOfMonth.getDay() + 6) % 7;
  const lastDay = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth() + 1, 0).getDate();

  // Bouw array: eerst offset lege cellen, dan dagen 1 t/m laatste dag
  const calendarCells = [];
  for (let i = 0; i < offset; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= lastDay; day++) {
    calendarCells.push(day);
  }

  // Wanneer op een dagcel wordt geklikt: zoek bijbehorende weerdata (op basis van dagnummer)
  const handleDayClick = (dayNumber) => {
    const dayData = weatherData[dayNumber - 1];
    if (dayData) {
      setSelectedDayData(dayData);
    }
  };

  // Sluit de modal
  const closeModal = () => {
    setSelectedDayData(null);
  };

  return (
    <div>
      <h2>
        Weer in {city ? city : "geen stad ingevuld"} - {yearMonth}
      </h2>
      {/* Boven de kalender: "Temperatuur" in plaats van datum tot datum */}
      <p>Temperatuur</p>
      {/* Als er nog geen stad is ingevuld, geef dan een invoerveld en knop */}
      {!city && (
        <div>
          <label>
            Stad:{" "}
            <input
              type="text"
              value={inputCity}
              onChange={(e) => setInputCity(e.target.value)}
            />
          </label>
          <button onClick={() => fetchCoordinates(inputCity)}>Opslaan</button>
        </div>
      )}
      {loading && <p>Gegevens laden...</p>}
      {error && <p style={{ color: "yellow" }}>{error}</p>}
      {/* Kalender met 7 kolommen (Ma t/m Zo) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
        {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((day) => (
          <div 
            key={day} 
            style={{ textAlign: "center", fontWeight: "bold", borderBottom: "1px solid #000" }}>
            {day}
          </div>
        ))}
       {calendarCells.map((cell, index) => {
          if (cell === null) {
            return <div key={index} style={{ border: "1px solid #ccc", minHeight: "50px" }} />;
          } else {
            const weather = weatherData[cell - 1];
            const temperature = weather ? weather.temperature : null;
            
            // Bereken de kleur van blauw (-10) naar rood (+40), met 65% transparantie
            const minTemp = -10;
            const maxTemp = 40;
            const normalizedTemp = Math.max(0, Math.min(1, (temperature - minTemp) / (maxTemp - minTemp)));
            const red = Math.round(255 * normalizedTemp);
            const blue = Math.round(255 * (1 - normalizedTemp));
            const backgroundColor = `rgba(${red}, 0, ${blue}, 0.65)`;
            
            return (
              <div
                key={index}
                style={{
                  border: "1px solid #ccc",
                  minHeight: "50px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backgroundColor,
                }}
                onClick={() => handleDayClick(cell)}
              >
                <div>{cell}</div>
                <div>{weather ? getTemperatureSymbol(weather.temperature) + ' (' + Math.round(weather.temperature) + ') ' : ""}</div>
              </div>
            );
          }
        })}

      </div>
      {/* Modal of popup met details voor een geselecteerde dag */}
      {selectedDayData && (
        <div style={{
          color: "black",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "5px", minWidth: "300px" }}>
            <h3>Weergegevens voor {selectedDayData.date}</h3>
            <p>Temperatuur: {selectedDayData.temperature}°C {getTemperatureSymbol(selectedDayData.temperature)}</p>
            <p>Vochtigheid: {selectedDayData.humidity}%</p>
            <p>Regen: {selectedDayData.precipitation} mm</p>
            <button onClick={closeModal}>Sluiten</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherCalendar;
