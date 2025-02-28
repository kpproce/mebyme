// gecreeerd door chatGPT 28 feb 2025
// toont de 5 dagdelen in de volledige breedte van de parent.
// in dagdelenString bijv: "02410"
import React, { useState, useEffect } from "react";
import propTypes from "prop-types";

const DagdelenEdit = ({ dagdeelWaardes }) => {
  const [waarden, setWaarden] = useState(dagdeelWaardes.split("").map(Number));
  const [actieveIndex, setActieveIndex] = useState(null);
  const [tijdelijkeWaarde, setTijdelijkeWaarde] = useState(null);

  useEffect(() => {
    setWaarden(dagdeelWaardes.split("").map(Number));
  }, [dagdeelWaardes]);

  const namen = ["Nacht", "Opstaan", "Ochtend", "Middag", "Avond"];

  const startBewerken = (index) => {
    setActieveIndex(index);
    setTijdelijkeWaarde(waarden[index]); // Startwaarde vastzetten
  };

  const bevestigWijziging = () => {
    const nieuweWaarden = [...waarden];
    nieuweWaarden[actieveIndex] = tijdelijkeWaarde;
    setWaarden(nieuweWaarden);
    setActieveIndex(null);
  };

  const annuleerWijziging = () => {
    setTijdelijkeWaarde(null);
    setActieveIndex(null);
  };

  const switchIndex = (nieuweIndex) => {
    if (nieuweIndex >= 0 && nieuweIndex <= 4) {
      bevestigWijziging(); // Eerst opslaan voordat we wisselen
      startBewerken(nieuweIndex);
    }
  };

  return (
    <>
      <table className="dagdelenEdit_tabelStyle">
        <thead>
          <tr>
            <th>N</th><th>O</th><th>M</th><th>M</th><th>N</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {waarden.map((waarde, index) => (
              <td key={index} onClick={() => startBewerken(index)}>
                {waarde}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {actieveIndex !== null && (
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
            width: "300px",
            textAlign: "center",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button onClick={() => switchIndex(actieveIndex - 1)} disabled={actieveIndex === 0}>&lt;</button>
            <h4>{namen[actieveIndex]} ({waarden[actieveIndex]})</h4>
            <button onClick={() => switchIndex(actieveIndex + 1)} disabled={actieveIndex === 4}>&gt;</button>
          </div>

          <input
            type="range"
            min="0"
            max="5"
            value={tijdelijkeWaarde}
            onChange={(e) => setTijdelijkeWaarde(Number(e.target.value))}
          />
          <p style={{ color: 'black', fontSize: "x-large"  }}><strong>{tijdelijkeWaarde}</strong></p>

          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
            <button onClick={bevestigWijziging} style={{ background: "green", color: "white", padding: "5px 10px" }}>✔</button>
            <button onClick={annuleerWijziging} style={{ background: "red", color: "white", padding: "5px 10px" }}>❌</button>
          </div>
        </div>
      )}

      {actieveIndex !== null && (
        <div
          onClick={annuleerWijziging}
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
