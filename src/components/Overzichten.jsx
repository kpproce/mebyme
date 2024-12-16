import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Kalender from "./Kalender"; // Zorg ervoor dat je Agenda importeert
import Agenda from "./Agenda"; // Zorg ervoor dat je Agenda importeert
import {basic_API_url}         from './global_const.js'

function Overzichten({ username, apikey, yearMonth}) {
  const [selectedMonthYear, setSelectedMonthYear] = useState(yearMonth);
  const [selectedAspect, setSelectedAspect] = useState("");
  const [aspectenLijst, setAspectenLijst] = useState([]);
  const [loading, setLoading] = useState(true); // Om te controleren of de data geladen is
  const [error, setError] = useState(null); // Om eventuele fouten bij het ophalen van data op te vangen

  const [hoofdAspect, setHoofdAspect]  = useState("")
  const [bijAspect1,  setBijAspect1]   = useState("")
  const [bijAspect2,  setBijAspect2]   = useState("")

  const fetchURL =   basic_API_url() + "php/mebyme.php"
  // Functie om de maand te updaten
  const updateMonth = (direction) => {
    const [year, month] = selectedMonthYear.split("-").map(Number);
    const newDate = new Date(year, month - 1 + direction, 1);
    const newYearMonth = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonthYear(newYearMonth);
  };

  const selectStyle = {
    width: '13rem',
    border: '1px solid #ddd',
    padding: '0.25rem',
  };
  
  const labelStyle = {
    width: '10rem',
    textAlign: 'right',
    marginRight: '1rem',
    backgroundColor: '#A1eb9'
  };
  
  const bovenDivStyle ={ 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '0.5rem', 
    backgroundColor: '#09505f',
    padding: '10px 0'  
  }

  // Functie om de aspectenlijst op te halen via de API
  const getData = async () => {
    setLoading(true);
    try {
      const postData = new FormData();
      postData.append("username", username);
      postData.append("apikey", apikey);
      postData.append("action", "get_userAspects_data");

      const response = await fetch(fetchURL, {
        method: "POST",
        body: postData,
      });

      if (!response.ok) {
        throw new Error("API response was not ok");
      }

      const data = await response.json();
      
      if (data && data.resultData && Array.isArray(data.resultData)) {
        setAspectenLijst(data.resultData); // Gegevens uit API opslaan

        setSelectedAspect(data.toonAspect); // Zet het geselecteerde aspect
      } else {
        throw new Error("Geen geldige data ontvangen");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (yearMonth) => {
    const date = new Date(yearMonth + "-01"); // Maak een datum van de eerste dag van de maand
    return new Intl.DateTimeFormat('nl-NL', { month: 'long' }).format(date); // Gebruik Intl.DateTimeFormat voor de maandnaam
  };

  const getMonthNameWithYear = (yearMonth) => {
    const date = new Date(yearMonth + "-01"); // Maak een datum van de eerste dag van de maand
    const monthName = new Intl.DateTimeFormat('nl-NL', { month: 'long' }).format(date); // Verkrijg de maandnaam
    const year = date.getFullYear().toString().slice(-2); // Verkrijg de laatste twee cijfers van het jaar
    return `${monthName} ${year}`; // Combineer maandnaam en jaar
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

      <div style={bovenDivStyle}>
       
  {/* Eerste rij */}
  <div style={{ display: 'flex', alignItems: 'center' }}>
      <label style={labelStyle}>Hoofd Aspect (kleur):</label>
      <select
        style={selectStyle}
        value={hoofdAspect} // De geselecteerde waarde is gekoppeld aan hoofdAspect state
        onChange={(e) => setHoofdAspect(e.target.value)} // Bij wijziging wordt hoofdAspect bijgewerkt
      >
        {/* Opties */}
        {aspectenLijst.map((item, index) => (
          <option key={index} value={item.aspect}>
            {item.aspect}
          </option>
        ))}
      </select>
    </div>

    {/* Tweede rij */}
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <label style={labelStyle}>Links Onder:</label>
      <select
        style={selectStyle}
        value={bijAspect1} // De geselecteerde waarde is gekoppeld aan bijAspect1 state
        onChange={(e) => setBijAspect1(e.target.value)} // Bij wijziging wordt bijAspect1 bijgewerkt
      >
        {/* Opties */}
        {aspectenLijst.map((item, index) => (
          <option key={index} value={item.aspect}>
            {item.aspect}
          </option>
        ))}
      </select>
    </div>

    {/* Derde rij */}
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <label style={labelStyle}>Rechts Onder:</label>
      <select
        style={selectStyle}
        value={bijAspect2} // De geselecteerde waarde is gekoppeld aan bijAspect2 state
        onChange={(e) => setBijAspect2(e.target.value)} // Bij wijziging wordt bijAspect2 bijgewerkt
      >
        {/* Opties */}
        {aspectenLijst.map((item, index) => (
          <option key={index} value={item.aspect}>
            {item.aspect}
          </option>
        ))}
      </select>
    </div>
      </div>
  
        {/* Navigatie voor maand */}
        <div style={{ 
            display: "flex", 
            alignItems: "center", 
            margin: "20px 10px", 
            justifyContent: "space-between"
            
          }}>
          <button onClick={() => updateMonth(-1)}>&lt;</button>
          <label 
            htmlFor="aspect-select"
            
          >
        </label>
       
        <span style={{ margin: "5px 10px" }}>{getMonthNameWithYear(selectedMonthYear)}</span>
        <button onClick={() => updateMonth(1)}>&gt;</button>
      </div>



      <br/>
      {/* Agenda component aanroepen */}
      <Kalender
        username    = {username}
        apikey      = {apikey}
        yearMonth   = {selectedMonthYear}
        aspect_type = {selectedAspect.aspect}
      />
    </div>
  );
}

Overzichten.propTypes = {
  username: PropTypes.string.isRequired,
  apikey: PropTypes.string.isRequired,
  yearMonth: PropTypes.string.isRequired,
};

export default Overzichten;
