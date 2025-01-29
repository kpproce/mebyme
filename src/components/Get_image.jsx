// import {useState, useEffect, useCallback  } from 'react'
import PropTypes from 'prop-types'
import {imageUrl} from './global_const.js'


const Get_image = (props) => { 
  

  return (
    <>
      imageUrl: {imageUrl}
    </>  
  )  
}

<get_image 
  aspect   = 'benauwd'
  max_size = '3MB'
></get_image>


Get_image.propTypes = {

  aspect_type      : PropTypes.string.isRequired,
  size             : PropTypes.string.isRequired,
  available_images : PropTypes.array.isRequired,
  waarde           : PropTypes.any.isRequired,


// callBack_myUsers_from_editRole: propTypes.func.isRequired
}

export default Get_image