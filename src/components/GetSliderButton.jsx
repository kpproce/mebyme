// import {useState, useEffect, useCallback  } from 'react'
import PropTypes from 'prop-types'
import {Button} from "react-bootstrap";
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
    // onsole.log('26: waarde: ' + waarde + ' type: ' + typeof(waarde))
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

  function getIconLink_from_aspect(aspect) {

  }


  function getPresentation(aspect_type, icon, waarde) { // size = basic, small, large
    
    waarde = "" + waarde
    
    
    if (waarde == "0") {
      return "-" 
    } else {

      // zit icon in de available_icons, let op de extentie uit de available_icons niet menemen. 
      let available_icon1 =  "" + props.available_icons.filter(available_icon => available_icon.substring(0, available_icon.indexOf(".")) === icon);
        // (dataRow, dataRowIndex) => 
      let image_url_src = imageUrl() + 'mebyme_icons/' + available_icon1
        // console.log('69a:  icon: ' + icon  + ' available_icon: -' + available_icon1 +  '- lengte: ' + available_icon1.length)
        // console.log('69a1: lengte: ' + available_icon1.length)
      if (available_icon1.length > 3) {
        // console.log('69c:  length > 3' ) 
        // console.log('69b:  icon: ' + icon  + 'icon full path: ' + image_url_src)     
        return <img src={image_url_src} height='20px' width='20px'></img>;
      } else {
        // console.log('69b:  icon: ' + icon  + ' basis ')

        if (aspect_type === 'welzijn') {
          switch (waarde) {
            case "1": return '😁';
            case "2": return '😐';
            case "3": return '😦';
            case "4": return '😒';
            case "5": return '😡';
          }
        }

        // dit moet nog generiek, lees aspect_types --> zoek dat plaatje

        if (aspect_type === 'medicatie') {
           image_url_src = imageUrl() + 'mebyme_icons/' + "med_basis.png"
           return <img src={image_url_src} height='20px' width='20px'></img>;    
        }
        if (aspect_type === 'gedaan') {
          image_url_src = imageUrl() + 'mebyme_icons/' + "gedaan.png"
          // console.log('93:  icon: ' + icon  + 'icon full path: ' + image_url_src)     

         return <img src={image_url_src} height='20px' width='20px'></img>;    

        }
      }
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
    
      {getPresentation(props.aspect_type, props.icon, props.waarde )}
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