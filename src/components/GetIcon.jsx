// import {useState, useEffect, useCallback  } from 'react'
import PropTypes from 'prop-types'
import {imageUrl} from './global_const.js'

//import inspanning_2 from 'https://www.kimproce.nl/mebyme/images/biking_easy.png';
//import inspanning_4 from 'https://www.kimproce.nl/mebyme/images/mountain-bicyclist-small.png';

//import medicijn_basis_2 from 'https://www.kimproce.nl/mebyme/images/medicijn_standaard.jpg';
//import medicijn_basis_4 from 'https://www.kimproce.nl/mebyme/images/medicijn_extra.jfif';



const GetIcon = (props) => { 
  
  function getPresentation() { // size = basic, small, large
    
    let waarde = "" + props.waarde
    //console.log('18: getPresentation aangeroepen met waarde: ' + waarde +  ', aspect_type: ' + props.aspect_type)
    //console.log(props.available_icons)

    if (waarde == "0") {
      return "-" 
    
    } else {

      if (props.aspect_type === 'welzijn') {
        switch (waarde) {
          case "1": return '😁';
          case "2": return '😐';
          case "3": return '😦';
          case "4": return '😒';
          case "5": return '😡';
        }
      }

      if (props.aspect_type === 'medicatie') {
          image_url_src = imageUrl() + 'mebyme_icons/' + "med_basis.png"
          return <img src={image_url_src} height='20px' width='20px'></img>;    
      }

      if (props.aspect_type === 'gedaan') {
        image_url_src = imageUrl() + 'mebyme_icons/' + "gedaan.png"

        return <img src={image_url_src} height='20px' width='20px'></img>;    
      }

      let available_icon1 =  "" + props.available_icons.filter(
        available_icon => available_icon.substring(0, available_icon.indexOf(".")) === props.aspect_type
      );

      let image_url_src = imageUrl() + 'mebyme_icons/' + available_icon1

      if (available_icon1.length > 3) {
        return <img src={image_url_src} height='20px' width='20px'></img>;
      }
    }
    
  }

  return (
    <>
      {getPresentation( )}
    </>  
  )  
}

GetIcon.propTypes = {

  aspect_type     : PropTypes.string.isRequired,
  size            : PropTypes.string.isRequired,
  available_icons : PropTypes.array.isRequired,
  waarde          : PropTypes.any.isRequired,


// callBack_myUsers_from_editRole: propTypes.func.isRequired
}

export default GetIcon