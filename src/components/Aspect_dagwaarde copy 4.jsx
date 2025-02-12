import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./Aspect_dagwaarde.css";
import { FaTrash} from 'react-icons/fa';
import { FaTimes, FaRegTimesCircle } from "react-icons/fa";

const Aspect_dagwaarde = (props) => {
  // const [waarde, setWaarde] = useState(props.dagWaarde); // Dynamische waarde
  const [icon, setIcon] = useState(props.icon); // Dynamische waarde
  const [borderColor, setBorderColor] = useState(""); // Dynamische border kleur
  const maxWaarde = 5; // Maximaal aantal niveaus
  const [dagWaarde, setDagWaarde] = useState(props.dagWaarde); 
  const [deleteRequest, setDeleteRequest] = useState(false); 
  
  // Bepaal de border-kleur van .dagAsp_contMain_left op basis van de divjes
  useEffect(() => {
    const colorClass = `.bg_${props.aspect_type}_color_${dagWaarde}`;
    const divElement = document.querySelector(colorClass);
    console.log('21: useEffect',dagWaarde)
    if (divElement) {
      const bgColor = getComputedStyle(divElement).backgroundColor; // Haal de achtergrondkleur van de div op
      setBorderColor(bgColor); // Zet de borderkleur
    }
  }, [props.dagWaarde, dagWaarde, props.aspect_type]); // Herlaadt bij verandering van waarde of props.aspect_type


  function getContrastingColor(className) {
    // Haal het element op met de opgegeven classnaam
    const element = document.querySelector(`.${className}`);
    if (!element) return null;
  
    // Haal de achtergrondkleur van de class op
    const backgroundColor = getComputedStyle(element).backgroundColor;
  
    // Extract de RGB-waarden
    const rgbMatch = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!rgbMatch) return null;
  
    const [_, r, g, b] = rgbMatch.map(Number);
  
    // Bereken de relatieve luminantie (https://www.w3.org/TR/WCAG21/#dfn-relative-luminance)
    const luminance = (value) => {
      value /= 255;
      return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    };
    const relativeLuminance = 0.2126 * luminance(r) + 0.7152 * luminance(g) + 0.0722 * luminance(b);
  
    // Bepaal contrasterende kleur: zwart bij lichte achtergrond, wit bij donkere achtergrond
    return relativeLuminance > 0.5 ? "black" : "white";
  }
  
  // Dynamisch de className bepalen voor elk divje
  const getClassNameForDiv = (index) => {
    const waardeIndex = maxWaarde - index; // Omgekeerde volgorde (bovenste div = hoogste waarde)
    if (waardeIndex > dagWaarde) {
      return "dagAsp_empty_waarde"; // Inactieve stijl
    } else {
      return `bg_${props.aspect_type}_color_${dagWaarde}`; // Actieve stijl met de opgegeven waarde
    }
  };

  return (
    <div className="dagAsp_contMain">
     
      {/* Linkerdeel */}
      <div className="dagAsp_contMain_left" style={{ border: `6px solid ${borderColor || "rgb(200, 200, 200)"}` }}>
        {/* Bovenin */}
        <div className="dagAsp_del_en_naam">
          <div
            className={`blackAshtray`}
            onClick={() => { 
              setDeleteRequest(true) 
              props.callBack_handleDeleteRequest(props.index, true)
            }}
              //props.callBack_handleChangeDagWaarde(5 - index)}
          >
            <FaTrash size={20} />{/* Waarde weergeven */}
          </div>
          <div className="dagAsp_cont_text">  
            {props.aspect} 
          </div>
        
        </div>    
        {/* <div className="dagAsp_cont_text">{dagWaarde} </div> */}
        <div className="dagAsp_cont_icon">
          {deleteRequest
            ? <FaRegTimesCircle 
                size={60} 
                color={'grey' } 
                onClick={() => {
                  props.callBack_handleDeleteRequest(props.index, false); 
                  setDeleteRequest(false) 
                }}
                style={{marginTop:"20px"}} 
              /> 
            : <img src={props.icon} alt="icon"/>   
          }
        </div>
          
      </div>
        {/* Rechterdeel */}
      <div className="dagAsp_contMain_right">
        {deleteRequest
          ? ""
          : [...Array(maxWaarde)].map((_, waardeIndex) => (
            <div
              key={waardeIndex}
              className={`dagAsp_value_divjes_basis ${getClassNameForDiv(waardeIndex)}`}
              style={{
                color: getContrastingColor(getClassNameForDiv(waardeIndex)), // Dynamisch kleurcontrast berekenen
              }}
              onClick={() => {
                setDagWaarde(5 - waardeIndex)
                props.callBack_handleChangeDagWaarde(props.index, (5-waardeIndex))
              }}
                //props.callBack_handleChangeDagWaarde(5 - waardeIndex)}
            >
              {maxWaarde - waardeIndex} {/* Waarde weergeven */}
            </div> 
          ))
        }
        
      </div>

    </div>
  );
};

Aspect_dagwaarde.propTypes = {
  dagWaarde: PropTypes.number.isRequired, // Tussen 0 en 5
  aspect_type: PropTypes.string.isRequired, // Dynamische aspect type
  aspect : PropTypes.string.isRequired, // Dynamische aspect
  callBack_handleChangeDagWaarde: PropTypes.func.isRequired, // Callback functie
  callBack_handleDeleteRequest: PropTypes.func.isRequired, // Callback functie

};

export default Aspect_dagwaarde;
