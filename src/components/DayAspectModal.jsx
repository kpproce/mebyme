import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { basic_API_url } from "./global_const.js";

function DayAspectModal({ username, apikey, selectedDayData, onClose }) {
  if (!selectedDayData) return null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function getData() {
    const postData = new FormData();
    const fetchURL = basic_API_url() + "php/mebyme.php";

    postData.append("username", username);
    postData.append("apikey",   apikey);
    postData.append("date",     selectedDayData.date);
    postData.append("aspect",   selectedDayData.aspect);

    postData.append("action", "getData_oneAspect_oneDay");

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
        const data = await getData();
        
      } catch (err) {
        setError("Failed to load data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);


  return (

    <div

      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
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
      <p>
        <strong>Aspect:</strong> {selectedDayData.aspect}
      </p>
      <p>
        <strong>Waarde:</strong> {selectedDayData.value}
      </p>
      <button
        onClick={onClose}
        style={{
          marginTop: "10px",
          padding: "5px 10px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "3px",
          cursor: "pointer",
        }}
      >
        Sluiten
      </button>
    </div>
  );
}

DayAspectModal.propTypes = {
  selectedDayData: PropTypes.shape({
    date: PropTypes.string.isRequired,
    aspect: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    aspect_type: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};

export default DayAspectModal;
