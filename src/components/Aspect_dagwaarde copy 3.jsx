import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./Aspect_dagwaarde.css";

const Aspect_dagwaarde = (props) => {
  const [titel, setTitel] = useState(props.titel); // Dynamische waarde
  const [icon, setIcon] = useState(props.icon); // Dynamische waarde
  const [borderColor, setBorderColor] = useState(""); // Dynamische border kleur
  const maxWaarde = 5; // Maximaal aantal niveaus

  // Update de waarde als de prop waarde verandert
  useEffect(() => {
    setWaarde(props.waarde); // Synchroniseer met parent
    console.log('15: useEffect', props.waarde)
  }, [props.waarde]);

  // Bepaal de border-kleur van .dagAsp_contMain_left op basis van de divjes
  useEffect(() => {
    const colorClass = `.bg_${props.aspect_type}_color_${props.waarde}`;
    const divElement = document.querySelector(colorClass);
    console.log('21: useEffect', props.waarde)
    if (divElement) {
      const bgColor = getComputedStyle(divElement).backgroundColor; // Haal de achtergrondkleur van de div op
      setBorderColor(bgColor); // Zet de borderkleur
    }
  }, [props.waarde, props.aspect_type]); // Herlaadt bij verandering van waarde of props.aspect_type

  // Dynamisch de className bepalen voor elk divje
  const getClassNameForDiv = (index) => {
    const waardeIndex = maxWaarde - index; // Omgekeerde volgorde (bovenste div = hoogste waarde)
    if (waardeIndex > props.waarde) {
      return "dagAsp_empty_waarde"; // Inactieve stijl
    } else {
      return `bg_${props.aspect_type}_color_${props.waarde}`; // Actieve stijl met de opgegeven waarde
    }
  };

  return (
    <div className="dagAsp_contMain">
    
      {/* Linkerdeel */}
      <div className="dagAsp_contMain_left" style={{ border: `10px solid ${borderColor || "rgb(200, 200, 200)"}` }}>
        <div className="dagAsp_cont_icon_and_text">
          <div className="dagAsp_cont_text">{props.aspect}</div>
          <div className="dagAsp_cont_text">{props.aspect_type}</div>
          <div className="dagAsp_cont_icon_">
            <img src={icon} alt="icon"/>
          </div>
        </div>
      </div>

      {/* Rechterdeel */}
      <div className="dagAsp_contMain_right">
        {[...Array(maxWaarde)].map((_, index) => (
          <div
            key={index}
            className={`dagAsp_value_divjes_basis ${getClassNameForDiv(index)}`}
            onClick={() => props.callBack_handleChangeDagWaarde(5 - index)}
          >
            {maxWaarde - index} {/* Waarde weergeven */}
          </div>
        ))}
      </div>
    </div>
  );
};

Aspect_dagwaarde.propTypes = {
  waarde: PropTypes.number.isRequired, // Tussen 0 en 5
  aspect_type: PropTypes.string.isRequired, // Dynamische aspect type
  aspect : PropTypes.string.isRequired, // Dynamische aspect
  callBack_handleChangeDagWaarde: PropTypes.func.isRequired, // Callback functie
};

export default Aspect_dagwaarde;
