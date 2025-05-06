import React, { useState, useEffect, useRef, useCallback } from 'react';
import { basic_API_url, imageUrl} from "./global_const.js";
import propTypes from "prop-types";
import './Kalender.css';
import EditDagModal from "./EditDagModal.jsx";
import computeDagwaarde from '../hooks/computeDagwaarde';

const Kalender = ({ setActiveMenu, username, apikey, yearMonth, callBack_changeMonth }) => {
  const [kalenderData, setKalenderData] = useState([]);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLoading, setShowLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const [dagdeelToepassen, setDagdeelToepassen] = useState([true, true, true, true, true]);
  const [gewicht, setGewicht] = useState(100);

  const dayNumberRef = useRef(null);

  // Voeg een ref toe voor swipe-detectie
  const touchStartXRef = useRef(null);


  const getBackgroundColorClass = (value, outsideMonth) => {
    const numericValue =
      (typeof value === 'number' && value >= 0 && value <= 5) || value === null ? value : 0;

    if (outsideMonth) 
      return `bk_faded_color_${Math.min(numericValue ?? 0, 5)}`
    else 
      return `bk_strong_color_${Math.min(numericValue ?? 0, 5)}`
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

  useEffect(() => {
    const opgeslagen = localStorage.getItem('dagdeelToepassen');
    if (opgeslagen) {
      setDagdeelToepassen(JSON.parse(opgeslagen));
    } else {
      const standaard = [true, true, true, true, true];
      localStorage.setItem('dagdeelToepassen', JSON.stringify(standaard));
      setDagdeelToepassen(standaard);
    }
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
  
        // uitrekenen dagWaarde op basis van dagDeelWaardes
        console.log('94: data.kalender_data:', data.kalender_data);

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
  }, [username, apikey, yearMonth, refresh, dagdeelToepassen, gewicht]);

  function callBack_refresh() {
    setRefresh(true);
  }

  // Verwerk kalenderData en voeg offset dagen toe zodat de eerste kolom (maandag) de juiste datum toont
  useEffect(() => {
    if (!kalenderData) return;

    const firstOfMonth = new Date(yearMonth + "-01");
    const lastOfMonth = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth() + 1, 0);

    const currentMonthDays = kalenderData.map((item) => {
      if (!item || !item.datum) return null;

      const datum = new Date(item.datum);
      const isOutsideCurrentMonth = datum < firstOfMonth || datum > lastOfMonth;
      const hoofd_aspect_data = item.hoofd_aspect;
      const hoofd_aspect_waarde_oud = parseInt(hoofd_aspect_data?.waarde, 10) || 0;
      let filter = dagdeelToepassen.map(val => (val ? '1' : '0')).join('')
      const hoofd_aspect_waarde = computeDagwaarde (
        hoofd_aspect_data?.waardeDagdelen || '00000', 'gem', gewicht, filter
      )
      if (datum.getDate() === 13) {
        console.log('130: ' , datum.getDate(), '-', datum.getMonth(), ' hoofd_aspect_waarde: ', hoofd_aspect_waarde, ' hoofd_aspect_data :', hoofd_aspect_data.waardeDagdelen, 'filter: ', filter);
      }
      const bijAspect1 = item.bijAspect1
      const bij_aspect1_data = item.bij_aspect1   || {};
      const bijAspect1Value = parseInt(bij_aspect1_data.waarde, 10) || 0;
      const bijAspect1Letter = bijAspect1Value > 0 ? bij_aspect1_data.letter?.toLowerCase() || "" : "";
      const bijAspect1Kleur = bij_aspect1_data[`kleur${bijAspect1Value}`];
      
      const bijAspect2 = item.bijAspect2
      const bij_aspect2_data = item.bij_aspect2 || {};
      const bijAspect2Value = parseInt(bij_aspect2_data.waarde, 10) || 0;
      const bijAspect2Letter = bijAspect2Value > 0 ? bij_aspect2_data.letter?.toLowerCase() || "" : "";
      const bijAspect2Kleur = bij_aspect2_data[`kleur${bijAspect2Value}`];
      //console.log('142: bijAspect2Kleur: ', item.bijAspect2, ' ', bij_aspect2_data[`kleur${bijAspect2Value}`]);
      const opmerking = item.opmerking

      return {
        datum: item.datum,
        hoofd_aspect_waarde,
        bijAspect1,
        bijAspect1Letter,
        bijAspect1Kleur,
        bijAspect1Value,
        bijAspect2,
        bijAspect2Letter,
        bijAspect2Kleur,
        bijAspect2Value,
        isOutsideCurrentMonth,
        opmerking,
      };
    }).filter((day) => day !== null);

    setDays(currentMonthDays);
    // console.log('148: currentMonthDays: ', JSON.stringify(currentMonthDays));
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
   // e.preventDefault();
  };

  const handledagdeelToepassen = (index) => {  
    setDagdeelToepassen((prev) => 
      prev.map((val, i) => (i === index ? !val : val))
    );
    //localStorage.setItem('dagdeelToepassen', dagdeelToepassen); 
    localStorage.setItem('dagdeelToepassen', JSON.stringify(dagdeelToepassen))
  };

  const dagdeelNaamKort = ["Na", "Op", "Oc", "Mo", "Av"];

  return (
    <div className="calendar" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchMove={handleTouchMove}>
     <div style={{ marginBottom: "10px", textAlign: "left" }}>
      <strong>Dagdelen: &nbsp;</strong>
      {dagdeelToepassen.map((val, i) => (
        <span key={i} style={{ display: "inline-block", marginRight: "10px" }}>
          {dagdeelNaamKort[i]}: 
          <input
            type="checkbox"
            checked={val}
            onChange={() => handledagdeelToepassen(i)}
          />
        </span> 
      ))}
    
        <select
          value={gewicht}
          onChange={(e) => setGewicht(Number(e.target.value))}
          style={{ marginLeft: "5px" }}
        >
          <option value={110}>Hoog</option>
          <option value={100}>Middel</option>
          <option value={90}>Laag</option>
        </select>
    </div>
    <div style={{ marginBottom: "10px", textAlign: "left" }}></div>     
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
          <div style={{ display: 'flex ', flexDirection: 'column' }}>
            <div
              key={day.datum}
              className={`outside-month calendar-day ${getBackgroundColorClass(day.hoofd_aspect_waarde, day.isOutsideCurrentMonth)}`}
            >
            {// console.log('237: ', JSON.stringify(day))
            }
            {//console.log('237: ', day.hoofd_aspect_waarde, day.bijAspect1Value ? day.bijAspect1Value : '-', day.bijAspect2Value ? day.bijAspect2Value : '-')
            }
            <div className="day-number">
              <EditDagModal 
                username={username}
                apikey            = {apikey}
                datum             = {day.datum}
                dateOutSideMonth  = {day.dateOutSideMonth}
                containerRef      = {dayNumberRef} 
                callBack_refresh  = {callBack_refresh}
              />
              </div>
            
              {day.bijAspect1Letter && (
                <div className="bij-aspect-1-container">
                  {//console.log('212:', day.datum, day.bijAspect1Kleur, day.bijAspect2Kleur)
                  }
                  <div
                    className="bij-aspect-1-square"
                    style={{ backgroundColor: day.bijAspect1Kleur }}
                  >
                    {day.bijAspect1Value ? day.bijAspect1Letter + day.bijAspect1Value : ""}
                  </div>
                </div>
              )}

              {day.bijAspect2Letter && (
                <div className="bij-aspect-2-container">
                  {console.log(223, day.bijAspect1Kleur)}
                  {console.log(JSON.stringify(day))}
                  <div
                    className="bij-aspect-2-square"
                    style={{ backgroundColor: day.bijAspect2Kleur }}
                  >

                  {day.bijAspect2Value 
                    ? (
                        <>
                          {/* <img src={imageUrl() + "mebyme_icons/" + day.bijAspect2 + ".png"} alt="" /> */}
                          {day.bijAspect2Value ? day.bijAspect2Letter + day.bijAspect2Value : ""}
                        </>
                      ) 
                    : ""
                  }
                  </div>

                </div>
              )}
              
            </div>

            <div style={{ fontSize:"x-small", marginBottom: "2px",minHeight: "1rem" }}>
              {day.opmerking ? day.opmerking.substring(0, 9) : ' '}
            </div>
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