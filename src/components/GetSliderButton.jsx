// import {useState, useEffect, useCallback  } from 'react'
import PropTypes from 'prop-types'
import {Button} from "react-bootstrap";
import GetIcon from './GetIcon.jsx'
import {imageUrl} from './global_const.js'

//import inspanning_2 from 'https://www.kimproce.nl/mebyme/images/biking_easy.png';
//import inspanning_4 from 'https://www.kimproce.nl/mebyme/images/mountain-bicyclist-small.png';

//import medicijn_basis_2 from 'https://www.kimproce.nl/mebyme/images/medicijn_standaard.jpg';
//import medicijn_basis_4 from 'https://www.kimproce.nl/mebyme/images/medicijn_extra.jfif';



const GetSliderButton = (props) => { 
  
  //console.log('17: iconlist from API:')
  //console.log(props.available_icons)
 
  const getClassName = (my_waarde) => {
    if ( my_waarde >=0 && my_waarde<=5 ) 
      return 'color_' + my_waarde
    else 
      return 'color_0'
  }  

  const getColor = (waarde) => {
    //console.log('26: waarde: ' + waarde + ' type: ' + typeof(waarde))
    waarde = "" + waarde
    switch (waarde) {
      case "0": return 'rgb(114, 136, 156)';
      case "1": return 'rgb(105, 250, 127)';
      case "2": return 'rgb(156, 216, 59)';
      case "3": return 'rgb(247, 232, 92)';
      case "4": return 'rgb(251, 164, 34)';
      case "5": return 'rgb(255, 15, 15)';
      default:
      return 'rgb(200, 200, 200)';
    }
  }  

  const getWidthFromSize = () => {
    if (props.size=='large') 
      return '3.2rem'
    else   
      return '1.8rem'
  }

  return (
      <Button 
        className= {getClassName(props.waarde)}   
        style={ 
          { backgroundColor: getColor(props.waarde),  
            width: getWidthFromSize(), 
            paddingLeft: "4px"}}
        onClick={() => props.callBack(props.waarde)}
      >
        <GetIcon        
                aspect_type     = {props.aspect_type} 
                icon            = {props.icon} 
                available_icons = {props.available_icons}
                waarde          = {props.waarde} 
                size            = {'large'} 
        />
      </Button>     
  )  
}

GetSliderButton.propTypes = {
  aspect_type     : PropTypes.string.isRequired,
  size            : PropTypes.string.isRequired,
  icon            : PropTypes.string.isRequired,
  available_icons : PropTypes.array.isRequired,
  waarde          : PropTypes.any.isRequired,
  callBack        : PropTypes.func.isRequired

// callBack_myUsers_from_editRole: propTypes.func.isRequired
}

export default GetSliderButton