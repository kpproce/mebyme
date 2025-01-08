import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Agenda from "./Agenda"; // Zorg ervoor dat je Agenda importeert

function Overzichten({ username, apikey, yearMonth, fetchURL }) {
  const [selectedMonthYear, setSelectedMonthYear] = useState(yearMonth);
  const [selectedAspect, setSelectedAspect] = useState("");
  const [aspectenlijst, setAspectenlijst] = useState([]);
  const [loading, setLoading] = useState(true); // Om te controleren of de data geladen is
  const [error, setError] = useState(null); // Om eventuele fouten bij het ophalen van data op te vangen

  // Functie om de maand te updaten
  const updateMonth = (direction) => {
    const [year, month] = selectedMonthYear.split("-").map(Number);
    const newDate = new Date(year, month - 1 + direction, 1);
    const newYearMonth = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonthYear(newYearMonth);
  };

  // Functie om de aspectenlijst op te halen via de API
  const getData = async () => {
    setLoading(true);
    try {
      const postData = new FormData();
      postData.append("username", username);
      postData.append("api", apikey);
      postData.append("action", "get_userAspects_data");

      const response = await fetch(fetchURL, {
        method: "POST",
        body: postData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      if (data && Array.isArray(data.aspecten)) {
        setAspectenlijst(data.aspecten);
        setSelectedAspect(data.aspecten[0]); // Zet het eerste aspect als geselecteerd
      } else {
        throw new Error("Geen geldige data ontvangen");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Gebruik useEffect om de data op te halen wanneer de component geladen wordt
  useEffect(() => {
    getData();
  }, [username, apikey, fetchURL]); // Voeg afhankelijkheden toe zodat de data opnieuw wordt opgehaald als een van deze verandert

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Overzichten</h2>

      {/* Selecteer aspect */}
      <div>
        <label htmlFor="aspect-select">Kies een aspect: </label>
        <select
          id="aspect-select"
          value={selectedAspect}
          onChange={(e) => setSelectedAspect(e.target.value)}
        >
          {aspectenlijst.map((aspect, index) => (
            <option key={index} value={aspect}>
              {aspect}
            </option>
          ))}
        </select>
      </div>

      {/* Navigatie voor maand */}
      <div style={{ display: "flex", alignItems: "center", margin: "20px 0" }}>
        <button onClick={() => updateMonth(-1)}>&lt;</button>
        <span style={{ margin: "0 10px" }}>{selectedMonthYear}</span>
        <button onClick={() => updateMonth(1)}>&gt;</button>
      </div>

      {/* Agenda component aanroepen */}
      <Agenda
        username={username}
        apikey={apikey}
        month={selectedMonthYear}
        aspect_type={selectedAspect}
      />
    </div>
  );
}

Overzichten.propTypes = {
  username: PropTypes.string.isRequired,
  apikey: PropTypes.string.isRequired,
  yearMonth: PropTypes.string.isRequired,
  fetchURL: PropTypes.string.isRequired, // Zorg ervoor dat fetchURL een prop is
};

export default Overzichten;
