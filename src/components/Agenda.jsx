import React, { useState, useEffect } from "react";
import { basic_API_url } from "./global_const.js";
import PropTypes from "prop-types";
import DayAspectModal from "./DayAspectModal";

function Agenda({ username, apikey, yearMonth, aspect_type }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agendaData, setAgendaData] = useState(null);


  const [selectedDayData, setSelectedDayData] = useState(null);

  async function getData(username, apikey, yearMonth) {
    const postData = new FormData();
    const fetchURL = basic_API_url() + "php/mebyme.php";

    postData.append("username", username);
    postData.append("apikey", apikey);
    postData.append("yearMonth", yearMonth);
    postData.append("action", "get_rapport_data");

    const requestOptions = {
      method: "POST",
      body: postData,
    };

    try {
      const res = await fetch(fetchURL, requestOptions);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const data = await getData(username, apikey, yearMonth);
        // setAgendaData(data.resultData); 

      } catch (err) {
        setError("Failed to load data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [yearMonth, username, apikey]);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const [year, selectedMonth] = yearMonth.split("-").map(Number);
  const daysInMonth = getDaysInMonth(year, selectedMonth);

  const firstDayOfMonth = new Date(year, selectedMonth - 1, 1).getDay();
  const adjustedFirstDayOfMonth = firstDayOfMonth === 0 ? 7 : firstDayOfMonth;

  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const date = `${yearMonth}-${String(index + 1).padStart(2, "0")}`;
    const dayData = agendaData?.find((item) => item.datum === date);
    return {
      date,
      value: dayData ? dayData.last_calc_waarde : 0,
      aspect: "benauwd",
    };
  });

  const getBackgroundColorClass = (value) => {
    // Ensure value is a valid number (0 to 5) and not null or invalid
    const numericValue = (typeof value === 'number' && value >= 0 && value <= 5) || value === null ? value : 0;
    return `bk_strong_color_${Math.min(numericValue ?? 0, 5)}`; // Use nullish coalescing for null/undefined
  };

  const paddedDays = Array(adjustedFirstDayOfMonth - 1).fill(null).concat(days);

  const monthName = new Date(`${yearMonth}-01`).toLocaleString("nl-NL", {
    month: "long",
    year: "numeric",
  });

  const weekDays = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

  const handleDayClick = (dayData) => {
    setSelectedDayData(dayData);
  };

  const closeModal = () => {
    setSelectedDayData(null);
  };

  return (
    <div style={{ margin: "0 10px" }}>
      {loading ? (
        <p>Loading data...</p> // Show loading message while data is being fetched
      ) : error ? (
        <p>{error}</p> // Show error message if fetching failed
      ) : (
        <>
          <p>
            Aspect: <strong>{aspect_type} {monthName}</strong>
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "5px",
              marginTop: "20px",
            }}
          >
            {weekDays.map((day, index) => (
              <div
                key={index}
                className="kalenderDag"
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  padding: "10px 0",
                  backgroundColor: "rgb(25, 87, 87)",
                  color: "rgb(209, 203, 203)",
                  border: "1px solid #ccc",
                }}
              >
                {day}
              </div>
            ))}

            {paddedDays.map((day, index) => {
              if (!day) return <div key={index} className="kalenderDag"></div>;

              const { date, value, aspect } = day;

              return (
                <div
                  key={index}
                  className={`kalenderDag ${
                    value >= 0 && value <= 5 ? getBackgroundColorClass(value) : ""
                  }`}
                  data-date={date}
                  style={{
                    height: "50px",
                    color: "black",
                    border: "1px solid #ddd",
                    textAlign: "center",
                    lineHeight: "50px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleDayClick({ date, aspect, value, aspect_type })}
                >
                  {new Date(date).getDate()}
                </div>
              );
            })}
          </div>

          {selectedDayData && (
            <DayAspectModal
              username        = {username}
              apikey          = {apikey}
              selectedDayData = {selectedDayData}
              onClose         = {closeModal}
            />
          )}
        </>
      )}
    </div>
  );
}

Agenda.propTypes = {
  username: PropTypes.string.isRequired,
  apikey: PropTypes.string.isRequired,
  yearMonth: PropTypes.string.isRequired,
  aspect_type: PropTypes.string.isRequired,
};

export default Agenda;
