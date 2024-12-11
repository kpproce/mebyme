import React, { useState, useEffect } from "react";
import { basic_API_url } from "./global_const.js";
import PropTypes from "prop-types";

function Agenda({ username, apikey, month, aspect_type }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastAspect_type, setLastAspect_type] = useState(null);
  const [agendaData, setAgendaData] = useState(null);
  const [selectedDayData, setSelectedDayData] = useState(null); // State for selected day's data
  const [tooltipPosition, setTooltipPosition] = useState(null); // Position of the tooltip

  async function getData(username, apikey, month) {
    const postData = new FormData();
    const fetchURL = basic_API_url() + "php/mebyme.php";

    postData.append("username", username);
    postData.append("apikey", apikey);
    postData.append("startDate", month);
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
        const data = await getData(username, apikey, month);
        setAgendaData(data.resultData);
      } catch (err) {
        setError("Failed to load data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [month, username, apikey]);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const [year, selectedMonth] = month.split("-").map(Number);
  const daysInMonth = getDaysInMonth(year, selectedMonth);

  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const date = `${month}-${String(index + 1).padStart(2, "0")}`;
    const dayData = agendaData
      ?.filter((item) => item.aspect_type === aspect_type)
      ?.find((item) => item.datum === date);
    return {
      date,
      value: dayData ? dayData.last_calc_waarde : 0,
      aspect: dayData ? dayData.aspect : null, // Add aspect data
    };
  });

  const monthName = new Date(`${month}-01`).toLocaleString("nl-NL", {
    month: "long",
    year: "numeric",
  });

  const weekDays = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

  // Handle cell click to show data in a tooltip
  const handleDayClick = (e, dayData) => {
    const rect = e.target.getBoundingClientRect(); // Get position of the clicked day
    const tooltipWidth = 200; // Set a fixed width for the tooltip (you can adjust this value)
    const tooltipHeight = 150; // Set a fixed height for the tooltip (adjust if necessary)
  
    let tooltipTop = rect.top + window.scrollY - 60; // Position above the cell
    let tooltipLeft = rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2; // Center the tooltip above the cell
  
    // Check if tooltip is going out of bounds on the right
    if (tooltipLeft + tooltipWidth > window.innerWidth) {
      tooltipLeft = window.innerWidth - tooltipWidth - 10; // Adjust to the right side of the screen
    }
  
    // Check if tooltip is going out of bounds on the left
    if (tooltipLeft < 10) {
      tooltipLeft = 10; // Adjust to the left side of the screen
    }
  
    // Check if tooltip is going out of bounds on the bottom
    if (tooltipTop + tooltipHeight > window.innerHeight) {
      tooltipTop = window.innerHeight - tooltipHeight - 10; // Adjust to the bottom of the screen
    }
  
    setTooltipPosition({
      top: tooltipTop,
      left: tooltipLeft,
    });
    setSelectedDayData(dayData);
  };

  // Function to close the tooltip
  const closeTooltip = () => {
    setSelectedDayData(null);
    setTooltipPosition(null);
  };

  return (
    <div style={{ margin: "0 10px" }}>
      <p>Aspect: <strong>{aspect_type} {monthName} </strong></p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "5px",
          marginTop: "20px",
        }}
      >
        {/* Dagen van de week */}
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

        {/* Kalenderdagen */}
        {days.map(({ date, value, aspect }, index) => (
          <div
            key={index}
            className={`kalenderDag ${value === 0 ? "valueZero" : ""}`}
            data-date={date}
            data-aspect={aspect}
            data-value={value}
            data-aspect_type={aspect_type}
            style={{
              height: "50px",
              border: "1px solid #ddd",
              textAlign: "center",
              lineHeight: "50px",
              backgroundColor:
                value > 0
                  ? `rgba(255, ${256 - value * 50}, ${256 - value * 50}, 0.6)`
                  : "rgb(25, 87, 87)",
              color: value === 0 ? "rgb(209, 203, 203)" : "#000", // Ensure text is visible when value is 0
              cursor: "pointer", // Indicate that the cell is clickable
            }}
            onClick={(e) => handleDayClick(e, { date, aspect, value, aspect_type })}
          >
            {new Date(date).getDate()} {/* Altijd de dag (dd) tonen */}
          </div>
        ))}
      </div>

      {/* Tooltip for selected day */}
      {selectedDayData && tooltipPosition && (
        <div
          style={{
            position: "absolute",
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            backgroundColor: "#f4f4f4",
            border: "1px solid #ddd",
            padding: "10px",
            borderRadius: "5px",
            color: "#333",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
          }}
        >
          <h3>Details voor {selectedDayData.date}</h3>
          <p><strong>Aspect:</strong> {selectedDayData.aspect}</p>
          <p><strong>Aspect Type:</strong> {selectedDayData.aspect_type}</p>
          <p><strong>Waarde:</strong> {selectedDayData.value}</p>
          <button
            onClick={closeTooltip}
            style={{
              marginTop: "10px",
              padding: "5px 10px",
              backgroundColor: "#e74c3c",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Sluiten
          </button>
        </div>
      )}
    </div>
  );
}

Agenda.propTypes = {
  username: PropTypes.string.isRequired,
  apikey: PropTypes.string.isRequired,
  month: PropTypes.string.isRequired,
  aspect_type: PropTypes.string.isRequired,
};

export default Agenda;
