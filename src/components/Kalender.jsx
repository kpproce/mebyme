import React, { useState, useEffect } from 'react';
import { basic_API_url } from "./global_const.js";
import PropTypes from "prop-types";
import './Kalender.css';

const Kalendar = ({ username, apikey, yearMonth }) => {
  const [kalenderData, setKalenderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getData(username, apikey, yearMonth);
        setKalenderData(data.resultData1 || []);
      } catch (err) {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, apikey, yearMonth]);

  const days = (kalenderData || []).map((item) => {
    if (!item || !item.datum) return null;

    const waarde = parseInt(item.hoofdaspect_last_calc_waarde, 10) || 0;
    const bijAspect1Value = parseInt(item.bij_aspect_1_last_calc_waarde, 10) || 0;
    const bijAspect1Letter = bijAspect1Value > 0 ? item.bij_aspect_1.charAt(0).toLowerCase() : '';
    const bijAspect1Kleur = item.kleur_bij_aspect_1 || '';

    // Nieuwe bij_aspect_2
    //const bijAspect2Value = parseInt(item.bij_aspect_2_last_calc_waarde, 10) || 0;
    //const bijAspect2Letter = bijAspect2Value > 0 ? item.bij_aspect_2.charAt(0).toLowerCase() : 'x';
    //const bijAspect2Letter = item.bij_aspect_2 ? item.bij_aspect_2.charAt(0).toLowerCase() : '';
    //const bijAspect2Kleur = item.bijAspect2Kleur || '#555'; // Standaard kleur

    const bijAspect2Value = parseInt(item.bij_aspect_2_last_calc_waarde, 10) || 0;
    const bijAspect2Letter = bijAspect2Value > 0 && item.bij_aspect_2 
      ? item.bij_aspect_2.charAt(0).toLowerCase() 
      : ''; // Geen letter als de waarde 0 of niet aanwezig is
    const bijAspect2Kleur = item.bijAspect2Kleur || '#555'; // Standaard kleur



    return {
      datum: item.datum,
      waarde,
      bijAspect1Letter,
      bijAspect1Kleur,
      bijAspect2Letter,
      bijAspect2Kleur,
    };
  }).filter(day => day !== null);

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
            className={`calendar-day ${getBackgroundColorClass(day.waarde)}`}
          >
            <div className="day-number">{getDayOfMonth(day.datum)}</div>

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

Kalendar.propTypes = {
  username: PropTypes.string.isRequired,
  apikey: PropTypes.string.isRequired,
  yearMonth: PropTypes.string.isRequired,
};

export default Kalendar;
