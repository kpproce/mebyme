import { useState } from "react"
import PropTypes from 'prop-types'
import {Button} from "react-bootstrap"
import "./Aspect_dagwaarde.css";

const Aspect_dagwaarde = (props) => { 
  const [icon, setIcon] = useState(props.Icon); 
  const [aspect, setAspect] = useState(props.Icon); 
  const [aspect_type, setAspect_type] = useState(props.aspect_type); 
  const [titel, setTitel] = useState(props.titel); 
  const [waarde, setWaarde] = useState(props.waarde); 
 
   //console.log(props.available_images)
 
  const getClassName = (my_waarde) => {
    if ( my_waarde >=0 && my_waarde<=5 ) 
      return 'color_' + my_waarde
    else 
      return 'color_0'
  }  

  // console.log("27:")
  // props.icon==null? console.log (' icon = null'):console.log(props.icon)

  const getColor = (waarde) => {
    //console.log('26: waarde: ' + waarde + ' type: ' + typeof(waarde))
    waarde = "" + waarde
    switch (waarde) {
      case "0": return 'rgb(114, 136, 156)';
      case "1": return 'rgb(1, 250, 127)';
      case "2": return 'rgb(156, 216, 59)';
      case "3": return 'rgb(247, 232, 92)';
      case "4": return 'rgb(251, 164, 34)';
      case "5": return 'rgb(255, 15, 15)';
      default:
      return 'rgb(200, 200, 200)';
    }
  }  

  return (
   /*  <Button onClick={ () => props.callBack(props.waarde)} className={`slider-button size-${props.size}`}>
      {props.icon}
    </Button>
    */
   <>
      {console.log('49: props ', props)}
      <div
        onClick={() => alert ('geklikt')} 
      >
        <div className="dagAsp_contMain">
            
            <div className="dagAsp_contMain_left">
                Links
                <div className="dagAsp_cont_icon_and_text">
                
                    <div className="dagAsp_cont_text">
              
                    </div>          
                    
                    <div className="dagAsp_cont_icon_">
                    
                    </div>
                </div>
            </div>

            <div className="dagAsp_contMain_right">
                rechts
                <div className = "color_empty_white"> 5 </div> 
                <div className = "color_welzijn_4"> 4 </div> 
                <div className = "color_welzijn_4"> 3 </div> 
                <div className = "color_welzijn_4"> 2 </div> 
                <div className = "color_welzijn_4"> 1 </div> 
            </div>
            
        </div>
      
      </div>
    </>
  )
}

Aspect_dagwaarde.propTypes = {  
  icon             : PropTypes.any.isRequired,
  aspect           : PropTypes.string.isRequired,
  aspect_type      : PropTypes.string.isRequired,
  titel            : PropTypes.string.isRequired,
  waarde           : PropTypes.any.isRequired


// callBack_myUsers_from_editRole: propTypes.func.isRequired
}

export default Aspect_dagwaarde