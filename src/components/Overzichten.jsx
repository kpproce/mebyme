import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Kalender from "./Kalender"; // Zorg ervoor dat je Kalender importeert
import WeatherHistory from "./WeatherHistory"; // Zorg ervoor dat je WeatherHistory component importeert
import { basic_API_url } from './global_const.js'

function Overzichten({ setActiveMenu, username, apikey, yearMonth }) {
  const [selectedMonthYear, setSelectedMonthYear] = useState(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed (Jan = 0)
    if (today.getDate() > 13) {
      // Huidige maand
      return `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    } else {
      // Vorige maand
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const year = currentMonth === 0 ? currentYear - 1 : currentYear;
      return `${year}-${String(previousMonth + 1).padStart(2, "0")}`;
    }
  });

  const [selectedAspect, setSelectedAspect] = useState("");
  const [aspectenLijst, setAspectenLijst] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoofdAspect, setHoofdAspect] = useState("");
  const [bijAspect1, setBijAspect1] = useState("");
  const [bijAspect2, setBijAspect2] = useState("");

  const [instellingenDiv_zichtbaar, setInstellingenDiv_zichtbaar] = useState(false);
  const [activeTab, setActiveTab] = useState("kalender"); // Staat 'kalender' standaard actief

  const fetchURL = basic_API_url() + "php/mebyme.php";

  const updateMonth = (direction) => {
    const [year, month] = selectedMonthYear.split("-").map(Number);
    const newDate = new Date(year, month - 1 + direction, 1);
    const newYearMonth = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonthYear(newYearMonth);
  };

  const selectStyle = {
    width: '8rem',
    border: '1px solid #ddd',
    padding: '0.25rem',
    marginLeft: '6px'
  };

  const labelStyle = {
    width: '10rem',
    textAlign: 'right',
    marginRight: '1rem',
    backgroundColor: '#A1eb9'
  };

  const bovenDivStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    backgroundColor: '#09505f',
    padding: '10px 0'
  };

  const get_userAspects_data = async () => {
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
        setAspectenLijst(data.resultData);
        setHoofdAspect(data.rapportSettings.hoofd_aspect);
        setBijAspect1(data.rapportSettings.bij_aspect_1);
        setBijAspect2(data.rapportSettings.bij_aspect_2);
      } else {
        throw new Error("Geen geldige rapport data ontvangen, check of gebruiker settings goed zijn ingevoerd");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const set_userAspects_data = async (hasp, aspRO, aspLO) => {
    setLoading(true);
    try {
      const postData = new FormData();
      postData.append("username", username);
      postData.append("apikey", apikey);
      postData.append("action", "set_userAspects_data");

      postData.append("hoofdAspect", hasp);
      postData.append("bijAspect1", aspRO);
      postData.append("bijAspect2", aspLO);

      const response = await fetch(fetchURL, {
        method: "POST",
        body: postData,
      });

      if (!response.ok) {
        throw new Error("API response was not ok");
      }

      const data = await response.json();

      if (!data.updated) {
        alert("Update mislukt: geen wijzigingen doorgevoerd.");
      }
    } catch (error) {
      alert(`Er is een fout opgetreden: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (yearMonth) => {
    const date = new Date(yearMonth + "-01");
    return new Intl.DateTimeFormat('nl-NL', { month: 'long' }).format(date);
  };

  const getMonthNameWithYear = (yearMonth) => {
    const date = new Date(yearMonth + "-01");
    const monthName = new Intl.DateTimeFormat('nl-NL', { month: 'long' }).format(date);
    const year = date.getFullYear().toString().slice(-2);
    return `${monthName} ${year}`;
  };

  useEffect(() => {
    get_userAspects_data();
  }, [username, apikey, fetchURL]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const renderTabContent = () => {
    if (activeTab === "kalender") {
      return (
        <Kalender
          setActiveMenu={setActiveMenu}
          username={username}
          apikey={apikey}
          yearMonth={selectedMonthYear}
          aspect_type={selectedAspect.aspect}
        />
      );
    } else if (activeTab === "weer") {
      return (
        <WeatherHistory
          aantalDagen={31}
        />
      );
    } else {
      return <div>Unknown tab</div>;
    }
  };

  return (
    <div>
      {/* Titel + Pijltje */}
      <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setInstellingenDiv_zichtbaar(!instellingenDiv_zichtbaar)}>
        <h3 style={{ margin: 0, fontSize: 'large' }}>Instellingen kleuren en letters</h3>
        <span style={{ marginLeft: '8px', fontSize: 'x-large' }}>{instellingenDiv_zichtbaar ? '▼' : '▶'}</span>
      </div>

      {/* Uitklapbare sectie */}
      {instellingenDiv_zichtbaar && (
        <div style={bovenDivStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={labelStyle}>Hoofd Aspect (kleur):</label>
            <select
              style={selectStyle}
              value={hoofdAspect}
              onChange={(e) => {
                setHoofdAspect(e.target.value);
                set_userAspects_data(e.target.value, bijAspect1, bijAspect2);
              }}
            >
              {aspectenLijst.map((item, index) => (
                <option key={index} value={item.aspect}>
                  {item.aspect}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex' }}>
            <div>
              <label>Links onder:</label>
              <select
                style={selectStyle}
                value={bijAspect2}
                onChange={(e) => {
                  setBijAspect1(e.target.value);
                  set_userAspects_data(hoofdAspect, bijAspect1, e.target.value);
                }}
              >
                {aspectenLijst.map((item, index) => (
                  <option key={index} value={item.aspect}>
                    {item.aspect}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginLeft: '8px' }}>
              <label>Rechts onder:</label>
              <select
                style={selectStyle}
                value={bijAspect1}
                onChange={(e) => {
                  setBijAspect1(e.target.value);
                  set_userAspects_data(hoofdAspect, e.target.value, bijAspect2);
                }}
              >
                {aspectenLijst.map((item, index) => (
                  <option key={index} value={item.aspect}>
                    {item.aspect}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Navigatie voor maand */}
      <div style={{ display: "flex", alignItems: "center", margin: "20px 10px", justifyContent: "space-between" }}>
        <button onClick={() => updateMonth(-1)}>&lt;</button>
        <span style={{ margin: "5px 10px" }}>{getMonthNameWithYear(selectedMonthYear)}</span>
        <button onClick={() => updateMonth(1)}>&gt;</button>
      </div>

      {/* Tabbladen */}
      <div style={{ display: "flex", marginBottom: "10px" }}>
        <button onClick={() => setActiveTab("kalender")} style={{ marginRight: "10px" }}>Kalender</button>
        <button onClick={() => setActiveTab("weer")}>Weer</button>
      </div>

      {/* Tab inhoud renderen */}
      {renderTabContent()}
    </div>
  );
}

Overzichten.propTypes = {
  setActiveMenu: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
  apikey: PropTypes.string.isRequired,
  yearMonth: PropTypes.string.isRequired,
};

export default Overzichten;
