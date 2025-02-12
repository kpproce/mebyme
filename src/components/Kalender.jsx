import React, { useState, useEffect, useRef,  useCallback } from 'react';
import { basic_API_url } from "./global_const.js";
import propTypes from "prop-types";
import './Kalender.css';
import { useNavigate } from "react-router-dom";
import EditDagModal from "./EditDagModal.jsx";

const Kalender = ({ setActiveMenu, username, apikey, yearMonth }) => {
  const navigate = useNavigate();
  const [kalenderData, setKalenderData] = useState([]);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [refresh, setRefresh] = useState(false);

  const dayNumberRef = useRef(null);  // Maak de ref voor de container = useRef(null); // Maak de ref in de parent

  const handleChange = (event) => {
    alert('aanpassen van de dagwaarde')

  };

  const getBackgroundColorClass = (value) => {
    const numericValue =
      (typeof value === 'number' && value >= 0 && value <= 5) || value === null ? value : 0;
    return `bk_strong_color_${Math.min(numericValue ?? 0, 5)}`;
  };

  const getData = async (username, apikey, yearMonth) => {
    const postData = new FormData();
    const fetchURL = basic_API_url() + "php/mebyme.php";

    postData.append("username", username);
    postData.append("apikey", apikey);
    postData.append("yearMonth", yearMonth);
    postData.append("action", "get_rapport_data");

    const requestOptions = { method: "POST", body: postData };
    try {
      const res = await fetch(fetchURL, requestOptions);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  };

  const callBack_updateWaardes = useCallback((nieuweWaardes) => {
    console.log("Wijzig waardes in Kalender:");
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getData(username, apikey, yearMonth);
        setKalenderData(data.kalender_data || []);
        setRefresh(false);
      } catch (err) {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
       
      }
    };

    fetchData();
   

  }, [username, apikey, yearMonth, refresh]);
  
  function callBack_refresh() {
    setRefresh(true)
  } 



  const adjustColor_V_oud = (value, baseColor) => {
    const adjust = (value < 3) ? 50 : -50;
    const [r, g, b] = baseColor.match(/\d+/g).map(Number);
  
    const newR = Math.min(255, Math.max(0, r + adjust));
    const newG = Math.min(255, Math.max(0, g + adjust));
    const newB = Math.min(255, Math.max(0, b + adjust));
    console.log('65: ', baseColor, `rgb(${newR}, ${newG}, ${newB})`)
    return `rgb(${newR}, ${newG}, ${newB})`;
  };
  
  const adjustColor = (value, baseColor) => {
    // Remove the '#' and convert to RGB
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
  
    // Determine the adjustment value based on bijAspect1Value
    const adjust = (value < 3) ? 50 : -50;
  
    // Adjust the RGB values, ensuring they stay within the valid range (0-255)
    const newR = Math.min(255, Math.max(0, r + adjust));
    const newG = Math.min(255, Math.max(0, g + adjust));
    const newB = Math.min(255, Math.max(0, b + adjust));
    let newColor = `#${((1 << 24) | (newR << 16) | (newG << 8) | newB).toString(16).slice(1).toUpperCase()}`
    // Convert the adjusted RGB back to hex and return it as a string
    console.log('85: ', value, baseColor, newColor)
    return newColor;
  };
  
  

  // Verwerk kalenderData en werk days bij
  useEffect(() => {
    if (!kalenderData) return;

    const processedDays = kalenderData
      .map((item) => {
        if (!item || !item.datum) return null;

        // Hoofd aspect
        const hoofd_aspect_data = item.hoofd_aspect;
        const hoofd_aspect_waarde =
          parseInt(hoofd_aspect_data?.waarde, 10) || 0;

        // Bij-aspect 1
        const bij_aspect1_data = item.bij_aspect1 || {};
        const bijAspect1Value = parseInt(bij_aspect1_data.waarde, 10) || 0;
        const bijAspect1Letter =
          bijAspect1Value > 0
            ? bij_aspect1_data.letter?.toLowerCase() || ""
            : "";
        const bijAspect1Kleur = bijAspect1Value > 0
            ? adjustColor(bijAspect1Value, bij_aspect1_data.kleur || "rgb(0, 255, 0)")
            : { r: 255, g: 0, b: 0 };
            // const bijAspect1Kleur = bijAspect1Value > 0 
        //   ? bij_aspect1_data.kleur || "green" 
        //   : "red";

        // Bij-aspect 2
        const bij_aspect2_data = item.bij_aspect2 || {};
        const bijAspect2Value = parseInt(bij_aspect2_data.waarde, 10) || 0;
        const bijAspect2Letter =
          bijAspect2Value > 0
            ? bij_aspect2_data.letter?.toLowerCase() || ""
            : "";
        // const bijAspect2Kleur =
        //   bijAspect2Value > 0 ? bij_aspect2_data.kleur || "blue" : "gray";
        const bijAspect2Kleur = bijAspect1Value > 0
        ? adjustColor(bijAspect1Value, bij_aspect1_data.kleur || "rgb(0, 255, 0)")
        : { r: 255, g: 0, b: 0 };

        // Return de dag-data
        return {
          datum: item.datum,
          hoofd_aspect_waarde,
          bijAspect1Letter,
          bijAspect1Kleur,
          bijAspect2Letter,
          bijAspect2Kleur,
        };
      })
      .filter((day) => day !== null);

    // Update de days state
    setDays(processedDays);
  }, [kalenderData]);

  const formatWeekday = (datum) =>
    new Intl.DateTimeFormat('nl-NL', { weekday: 'short' }).format(new Date(datum));

  const getDayOfMonth = (datum) => new Date(datum).getDate();

  return (
    <div className="calendar">
      {/* Header met dagen van de week */}
      <div className="calendar-header">
        {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((day) => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}
      </div>

      {/* Loading state */}
      {loading && <div className="loading">Laden...</div>}

      {/* Error state */}
      {error && <div className="error-message">{error}</div>}

      {/* Kalenderinhoud */}
      <div className="calendar-grid">
        {days.map((day) => (
          <div
            key={day.datum}
            className={`calendar-day ${getBackgroundColorClass(day.hoofd_aspect_waarde)}`}
          >
            <div className="day-number">
              <EditDagModal 
                username = {username}
                apikey = {apikey}
                datum = {day.datum}
                containerRef = {dayNumberRef} 
                callBack_refresh = {callBack_refresh}
              />
            </div>
            {// console.log('191 day:', username, apikey, day.datum)
            }

            {/* Rechts onder - bij_aspect_1 */}
            {day.bijAspect1Letter && (
              <div className="bij-aspect-1-container">
                <div
                  className="bij-aspect-1-square"
                  style={{ backgroundColor: day.bijAspect1Kleur }}
                >
                  {day.bijAspect1Letter}
                </div>
              </div>
            )}

            {/* Links onder - bij_aspect_2 */}
            {day.bijAspect2Letter && (
              <div className="bij-aspect-2-container">
                <div
                  className="bij-aspect-2-square"
                  style={{ backgroundColor: day.bijAspect2Kleur }}
                >
                  {day.bijAspect2Letter}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
Kalender.propTypes = {
  username: propTypes.string.isRequired,
  apikey: propTypes.string.isRequired,
  yearMonth: propTypes.string.isRequired,
};

export default Kalender;
