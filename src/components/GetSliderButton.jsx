import PropTypes from 'prop-types'
import {Button} from "react-bootstrap";


//import inspanning_2 from 'https://www.kimproce.nl/mebyme/images/biking_easy.png';
//import inspanning_4 from 'https://www.kimproce.nl/mebyme/images/mountain-bicyclist-small.png';

//import medicijn_basis_2 from 'https://www.kimproce.nl/mebyme/images/medicijn_standaard.jpg';
//import medicijn_basis_4 from 'https://www.kimproce.nl/mebyme/images/medicijn_extra.jfif';



const GetSliderButton = (props) => { 
  
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
   
    <Button 
      onClick={() => props.callBack(props.waarde)} 
      className={`
        slider-button btn-primary 
        bk_color_${props.waarde} 
        Button_${props.size === 'x-large' ? 'x-large' : props.size}`
      }
      style={{
        margin: '3px',
        padding: '3px',
        fontSize: props.size === 'x-large' ? '12px' : '14px',
        display: 'flex', // Flexbox for alignment
        alignItems: 'center', // Vertical centering
        justifyContent: 'center', // Horizontal centering
        overflow: 'visible', // Ensure content is not hidden
      }}
    >
      <span 
        style={{ 
          fontSize: '1.5rem', 
          display: 'inline-block' 
        }}>
        {props.icon} {/* Render the dynamic icon */}
      </span>
    </Button>
    </>
  )

}

GetSliderButton.propTypes = {  
  icon             : PropTypes.any.isRequired,
  size             : PropTypes.string.isRequired,
  waarde           : PropTypes.any.isRequired,


// callBack_myUsers_from_editRole: propTypes.func.isRequired
}

export default GetSliderButton