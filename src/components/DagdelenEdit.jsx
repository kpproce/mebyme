import React, { useState, useEffect } from "react";
import propTypes from "prop-types";
import "./DagdelenEdit.css";
import { callback } from "chart.js/helpers";

const DagdelenEdit = ({ dagdeelWaardes, aspect, callbackGewijzigdeWaardes }) => {
  const [waarden, setWaarden] = useState(dagdeelWaardes.split("").map(Number));
  const [tijdelijkeWaarden, setTijdelijkeWaarden] = useState([...waarden]);
  const [actief, setActief] = useState(false);

  useEffect(() => {
    setWaarden(dagdeelWaardes.split("").map(Number));
    setTijdelijkeWaarden(dagdeelWaardes.split("").map(Number));
  }, [dagdeelWaardes]);

  const namen = ["Nacht", "Opstaan", "Ochtend", "Middag", "Avond"];

  const bevestigWijzigingen = () => {
    setWaarden(prevWaarden => {
      const nieuweWaarden = [...tijdelijkeWaarden] 
      callbackGewijzigdeWaardes(Object.values(nieuweWaarden).join("")) // Callback aanroepen met de nieuwste waardes als een string (is een object) 
      return nieuweWaarden
    });
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
        <div className="dagdelenEdit_modal" onClick={(e) => e.stopPropagation()}>
          <h4>wijzig {aspect} {waarden} </h4>
           <table>
            <tbody>
              {namen.map((naam, index) => (
                <tr key={index}>
                  <td>{naam}</td>
                  <td>
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
                  </td>
                  <td>({tijdelijkeWaarden[index]})</td>
                </tr>
              ))}
            </tbody>
          </table>
  
          <div className="dagdelenEdit_buttons">
            <button onClick={bevestigWijzigingen} className="dagdelenEdit_button dagdelenEdit_button--confirm">
              ✔
            </button>
            <button onClick={annuleerWijzigingen} className="dagdelenEdit_button dagdelenEdit_button--cancel">
              ❌
            </button>
          </div>
        </div>
      )}

      {actief && <div className="dagdelenEdit_overlay" onClick={annuleerWijzigingen} />}
    </>
  );
};

DagdelenEdit.propTypes = {
  dagdeelWaardes: propTypes.string,
};

export default DagdelenEdit;
