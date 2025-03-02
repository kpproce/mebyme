import React, { useState, useEffect } from "react";
import propTypes from "prop-types";

const DagdelenEdit = ({ dagdeelWaardes }) => {
  const [waarden, setWaarden] = useState(dagdeelWaardes.split("").map(Number));
  const [tijdelijkeWaarden, setTijdelijkeWaarden] = useState([...waarden]);
  const [actief, setActief] = useState(false);

  useEffect(() => {
    setWaarden(dagdeelWaardes.split("").map(Number));
    setTijdelijkeWaarden(dagdeelWaardes.split("").map(Number));
  }, [dagdeelWaardes]);

  const namen = ["Nacht", "Opstaan", "Ochtend", "Middag", "Avond"];

  const bevestigWijzigingen = () => {
    setWaarden([...tijdelijkeWaarden]);
    setActief(false);
  };

  const annuleerWijzigingen = () => {
    setTijdelijkeWaarden([...waarden]);
    setActief(false);
  };

  return (
    <>
      <table className="dagdelenEdit_tabelStyle">
        <thead>
          <tr>
            {namen.map((naam, index) => (
              <th key={index}>{naam.charAt(0)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {waarden.map((waarde, index) => (
              <td key={index} onClick={() => setActief(true)}>
                {waarde}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {actief && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            padding: "20px",
            border: "1px solid #ccc",
            zIndex: 1000,
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            width: "350px",
            textAlign: "center",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h4>Pas waardes aan</h4>
          {namen.map((naam, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <label>{naam} ({tijdelijkeWaarden[index]})</label>
              <input
                type="range"
                min="0"
                max="5"
                value={tijdelijkeWaarden[index]}
                onChange={(e) => {
                  const nieuweWaarden = [...tijdelijkeWaarden];
                  nieuweWaarden[index] = Number(e.target.value);
                  setTijdelijkeWaarden(nieuweWaarden);
                }}
              />
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
            <button onClick={bevestigWijzigingen} style={{ background: "green", color: "white", padding: "5px 10px" }}>✔</button>
            <button onClick={annuleerWijzigingen} style={{ background: "red", color: "white", padding: "5px 10px" }}>❌</button>
          </div>
        </div>
      )}

      {actief && (
        <div
          onClick={annuleerWijzigingen}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
        />
      )}
    </>
  );
};

DagdelenEdit.propTypes = {
  dagdeelWaardes: propTypes.string,
};

export default DagdelenEdit;
