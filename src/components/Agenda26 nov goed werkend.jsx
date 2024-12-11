import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import PropTypes from "prop-types";

function Agenda({ username, apikey, month, aspect_type }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agendaData, setAgendaData] = useState(null);
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState(null);

  async function getData(username, apikey, month) {
    // Fetching data logic remains unchanged
  }

  useEffect(() => {
    async function fetchData() {
      // Fetching data logic remains unchanged
    }
    fetchData();
  }, [month, username, apikey]);

  const getDaysInMonth = (year, month) => {
    // Helper function remains unchanged
  };

  const [year, selectedMonth] = month.split("-").map(Number);
  const daysInMonth = getDaysInMonth(year, selectedMonth);

  const firstDayOfMonth = new Date(year, selectedMonth - 1, 1).getDay();
  const adjustedFirstDayOfMonth = firstDayOfMonth === 0 ? 7 : firstDayOfMonth;

  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const date = `${month}-${String(index + 1).padStart(2, "0")}`;
    const dayData = agendaData?.find((item) => item.datum === date);
    return {
      date,
      value: dayData ? dayData.last_calc_waarde : 0,
      aspect: "benauwd",
    };
  });

  const getBackgroundColorClass = (value) => {
    // Class logic remains unchanged
  };

  const paddedDays = Array(adjustedFirstDayOfMonth - 1).fill(null).concat(days);

  const handleDayClick = (e, dayData) => {
    const rect = e.target.getBoundingClientRect();
    const tooltipWidth = 200;
    const tooltipHeight = 150;

    let tooltipTop = rect.top + window.scrollY - 60;
    let tooltipLeft = rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2;

    if (tooltipLeft + tooltipWidth > window.innerWidth) {
      tooltipLeft = window.innerWidth - tooltipWidth - 10;
    }
    if (tooltipLeft < 10) {
      tooltipLeft = 10;
    }
    if (tooltipTop + tooltipHeight > window.innerHeight) {
      tooltipTop = window.innerHeight - tooltipHeight - 10;
    }

    setTooltipPosition({ top: tooltipTop, left: tooltipLeft });
    setSelectedDayData(dayData);
  };

  const closeTooltip = () => {
    setSelectedDayData(null);
    setTooltipPosition(null);
  };

  return (
    <div style={{ margin: "0 10px" }}>
      <p>
        Aspect: <strong>{aspect_type}</strong>
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "5px",
          marginTop: "20px",
        }}
      >
        {/* Weekdays */}
        {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((day, index) => (
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

        {/* Days */}
        {paddedDays.map((day, index) => {
          if (!day) return <div key={index} className="kalenderDag"></div>;

          const { date, value, aspect } = day;
          return (
            <div
              key={index}
              className={`kalenderDag ${getBackgroundColorClass(value)}`}
              data-date={date}
              data-aspect={aspect}
              data-value={value}
              style={{
                height: "50px",
                border: "1px solid #ddd",
                textAlign: "center",
                lineHeight: "50px",
                color: value === 0 ? "rgb(209, 203, 203)" : "#333",
                cursor: "pointer",
              }}
              onClick={(e) => handleDayClick(e, { date, aspect, value })}
            >
              {new Date(date).getDate()}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal position={tooltipPosition} data={selectedDayData} onClose={closeTooltip} />
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
