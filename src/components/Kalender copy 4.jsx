import React, { useState, useEffect, useRef, useCallback } from 'react';
import { basic_API_url } from "./global_const.js";
import propTypes from "prop-types";
import './Kalender.css';
import { useNavigate } from "react-router-dom";
import EditDagModal from "./EditDagModal.jsx";

const Kalender = ({ setActiveMenu, username, apikey, yearMonth, callBack_changeMonth }) => {
  const navigate = useNavigate();
  const [kalenderData, setKalenderData] = useState([]);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLoading, setShowLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const dayNumberRef = useRef(null);

  // Voeg een ref toe voor swipe-detectie
  const touchStartXRef = useRef(null);

  const handleChange = (event) => {
    alert('aanpassen van de dagwaarde');
  };

  const getBackgroundColorClass = (value) => {
    const numericValue =
      (typeof value === 'number' && value >= 0 && value <= 5) || value === null ? value : 0;
    return `bk_strong_color_${Math.min(numericValue ?? 0, 5)}`;
  };

  const getData = async (username, apikey, yearMonth, startDate, endDate) => {
    const postData = new FormData();
    const fetchURL = basic_API_url() + "php/mebyme.php";

    postData.append("username", username);
    postData.append("apikey", apikey);
    postData.append("yearMonth", yearMonth);
    postData.append("startDate", startDate);
    postData.append("endDate", endDate);
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
    const timeout = setTimeout(() => setShowLoading(true), 2000);
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const firstOfMonth = new Date(yearMonth + "-01");
        const lastOfMonth = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth() + 1, 0);

        // Bepaal de startDate
        let startDate = new Date(firstOfMonth);
        if (firstOfMonth.getDay() !== 1) { // Als de 1e van de maand geen maandag is
          startDate.setDate(firstOfMonth.getDate() - ((firstOfMonth.getDay() + 6) % 7));
        }
        startDate = startDate.toISOString().substring(0, 10);

        // Bepaal de endDate
        let endDate = new Date(lastOfMonth);
        if (lastOfMonth.getDay() !== 0) { // Als de laatste van de maand geen zondag is
          endDate.setDate(lastOfMonth.getDate() + (8 - lastOfMonth.getDay()));
        } else {
          endDate.setDate(lastOfMonth.getDate() + 1); // Voeg een dag toe als het al zondag is
        }
        endDate = endDate.toISOString().substring(0, 10);

        const data = await getData(username, apikey, yearMonth, startDate, endDate);
        setKalenderData(data.kalender_data || []);
        setRefresh(false);
      } catch (err) {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
        setShowLoading(false);
      }
    };
    fetchData();
    return () => clearTimeout(timeout);
  }, [username, apikey, yearMonth, refresh]);

  function callBack_refresh() {
    setRefresh(true);
  }

  const adjustColor = (value, baseColor) => {
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const adjust = (value < 3) ? 50 : -50;
    const newR = Math.min(255, Math.max(0, r + adjust));
    const newG = Math.min(255, Math.max(0, g + adjust));
    const newB = Math.min(255, Math.max(0, b + adjust));
    let newColor = `#${((1 << 24) | (newR << 16) | (newG << 8) | (newB)).toString(16).slice(1).toUpperCase()}`;
    console.log('85: ', value, baseColor, newColor);
    return newColor;
  };

  // Verwerk kalenderData en voeg offset dagen toe zodat de eerste kolom (maandag) de juiste datum toont
  useEffect(() => {
    if (!kalenderData) return;

    const firstOfMonth = new Date(yearMonth + "-01");
    // Pas getDay() aan zodat maandag index 0 is
    const offset = (firstOfMonth.getDay() + 6) % 7;

    const offsetDays = [];
    for (let i = 0; i < offset; i++) {
      const date = new Date(firstOfMonth);
      date.setDate(firstOfMonth.getDate() - offset + i);
      const datum = date.toISOString().substring(0, 10);
      const dayData = kalenderData.find(item => item.datum === datum) || {
        datum,
        hoofd_aspect_waarde: 0,
        bijAspect1Letter: "",
        bijAspect1Kleur: "",
        bijAspect2Letter: "",
        bijAspect2Kleur: ""
      };
      offsetDays.push(dayData);
    }

    const currentMonthDays = kalenderData
      .map((item) => {
        if (!item || !item.datum) return null;

        const hoofd_aspect_data = item.hoofd_aspect;
        const hoofd_aspect_waarde = parseInt(hoofd_aspect_data?.waarde, 10) || 0;

        const bij_aspect1_data = item.bij_aspect1 || {};
        const bijAspect1Value = parseInt(bij_aspect1_data.waarde, 10) || 0;
        const bijAspect1Letter = bijAspect1Value > 0 ? bij_aspect1_data.letter?.toLowerCase() || "" : "";
        const bijAspect1Kleur = bijAspect1Value > 0
          ? adjustColor(bijAspect1Value, bij_aspect1_data.kleur || "rgb(0, 255, 0)")
          : "";

        const bij_aspect2_data = item.bij_aspect2 || {};
        const bijAspect2Value = parseInt(bij_aspect2_data.waarde, 10) || 0;
        const bijAspect2Letter = bijAspect2Value > 0 ? bij_aspect2_data.letter?.toLowerCase() || "" : "";
        const bijAspect2Kleur = bijAspect1Value > 0
          ? adjustColor(bijAspect1Value, bij_aspect1_data.kleur || "rgb(0, 255, 0)")
          : "";

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

    setDays([...offsetDays, ...currentMonthDays]);
  }, [kalenderData, yearMonth]);

  const formatWeekday = (datum) =>
    new Intl.DateTimeFormat('nl-NL', { weekday: 'short' }).format(new Date(datum));

  const getDayOfMonth = (datum) => new Date(datum).getDate();

  // Swipe event handlers
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartXRef.current - touchEndX;
    const swipeThreshold = 50; // pixels
    if (deltaX > swipeThreshold) {
      // Swipe naar links -> volgende maand
      callBack_changeMonth(1);
    } else if (deltaX < -swipeThreshold) {
      // Swipe naar rechts -> vorige maand
      callBack_changeMonth(-1);
    }
    touchStartXRef.current = null;
  };

  // Voeg touchmove handler toe om standaardactie te voorkomen
  const handleTouchMove = (e) => {
    e.preventDefault();
  };

  return (
    <div className="calendar" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchMove={handleTouchMove}>
      <div className="calendar-header">
        {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((day) => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}
      </div>
      {showLoading && loading && <div className="loading">Laden...</div>}
      {error && <div className="error-message">{error}</div>}
      <div className="calendar-grid">
        {days.map((day) => (
          <div
            key={day.datum}
            className={`calendar-day ${getBackgroundColorClass(day.hoofd_aspect_waarde)}`}
          >
            <div className="day-number">
              <EditDagModal 
                username={username}
                apikey={apikey}
                datum={day.datum}
                containerRef={dayNumberRef} 
                callBack_refresh={callBack_refresh}
              />
            </div>
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
  callBack_changeMonth: propTypes.func
};

export default Kalender;