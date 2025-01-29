import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./Aspect_dagwaarde.css";

const Aspect_dagwaarde = (props) => {
  const [waarde, setWaarde] = useState(props.waarde); // Dynamische waarde
  const [titel, setTitel] = useState(props.titel); // Dynamische waarde
  const [aspect_type, setAspectType] = useState(props.aspect_type); // Dynamisch aspect type
  const [borderColor, setBorderColor] = useState(""); // Dynamische border kleur
  const maxWaarde = 5; // Maximaal aantal niveaus

  // Bepaal de border-kleur van .dagAsp_contMain_left op basis van de divjes
  useEffect(() => {
    const colorClass = `.bg_${aspect_type}_color_${waarde}`;
    const divElement = document.querySelector(colorClass); 

    if (divElement) {
      const bgColor = getComputedStyle(divElement).backgroundColor; // Haal de achtergrondkleur van de div op
      setBorderColor(bgColor); // Zet de borderkleur
    }
  }, [waarde, aspect_type]); // Herlaadt bij verandering van waarde of aspect_type

  // Dynamisch de className bepalen voor elk divje
  const getClassNameForDiv = (index) => {
    const waardeIndex = maxWaarde - index; // Omgekeerde volgorde (bovenste div = hoogste waarde)
    if (waardeIndex > waarde) {
      return "dagAsp_empty_waarde"; // Inactieve stijl
    } else {
      return `bg_${aspect_type}_color_${waarde}`; // Actieve stijl met de opgegeven waarde
    }
  };

  return (
    <div className="dagAsp_contMain" >
      {/* Linkerdeel */}
      <div className="dagAsp_contMain_left" style={{ border: `10px solid ${borderColor || "rgb(200, 200, 200)"}`, flex: 1 }}>
        <div className="dagAsp_cont_icon_and_text">
          <div className="dagAsp_cont_text">{titel}</div>
          <div className="dagAsp_cont_icon_">Icon hier</div>
        </div>
      </div>

      {/* Rechterdeel */}
      <div className="dagAsp_contMain_right" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {[...Array(maxWaarde)].map((_, index) => (
          <div key={index} 
            className={`dagAsp_value_divjes_basis ${getClassNameForDiv(index)}`}
            onClick={() => props.callBack_handleChangeDagWaarde(5-index)}
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
};

export default Aspect_dagwaarde;
