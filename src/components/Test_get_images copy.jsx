import {useState, useEffect, useCallback} from 'react';
import PropTypes from 'prop-types'
import { basic_API_url } from "./global_const.js";
import Aspect_dagwaarde from "./Aspect_dagwaarde.jsx";

const Test_get_images = (props) => { 
 
  const [imagesInfo, setImagesInfo ] = useState([])
  const [waarde, setWaarde] = useState(props.waarde)
  const [aspect, setAspect] = useState(props.aspect)
  const [aspect_type, setAspect_type] = useState(props.aspect_type)
  
  const callBack_handleChangeDagWaarde = useCallback((nieuweWaarde) => {
       setWaarde(nieuweWaarde)
       console.log('23: wijzig waarde: ' +  nieuweWaarde ) 
     },[])

  // haal de lijst op
  async function getFilenamesOnce() {
    const postData = new FormData();
    const fetchURL = basic_API_url() + "php/mebyme.php";
    postData.append("subfolderName", "./images/mebyme_icons");
    postData.append("sortColumn", "name_sort");
    postData.append("action", "lees_image_namen");

    const requestOptions = {
      method: "POST",
      body: postData,
    };
    try {
      const res = await fetch(fetchURL, requestOptions);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
  
      const data = await res.json(); // Only parse once
      console.log('36', data); // Log the data
      setImagesInfo(data.imagesInfo)
      return data; // Return the data for further use
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  } 
  
  useEffect(() => { 
    let result = getFilenamesOnce()
    console.log(result)

  // Code to run once after the initial render
  }, []);

  


  const get_image_with_Url= () => { // van huidig aspect



    let imagePath = 'http://localhost/mebyme_server/php/images/mebyme_icons/'
    
    // vind aspect in de lijst, zo nietvind dan aspect_type
    let zoek1 = aspect + '.png'// bijv: 'benauwd.png'
    let zoek2 = aspect + '.jpg'// bijv: 'benauwd.jpg'
    let zoek3 = aspect + '.jfif'// bijv: 'benauwd.jfif'
    let zoek4 = aspect_type + '.png'// bijv: 'benauwd.png'
    let zoek5 = aspect_type + '.jpg'// bijv: 'benauwd.png'
    let zoek6 = aspect_type + '.jfif'// bijv: 'benauwd.png'

    // ZOEK zoek1, en als dat nie lukt zoek2, etc in imagesInfo, zet de waarde in de imagename
    let imagename = 'benauwd.png'

    let image_with_Url  = imagePath + imagename
    return image_with_Url 
  } 

  return (
    <>
     < Aspect_dagwaarde 
           icon        = { get_image_with_Url() } 
           aspect      = { aspect }  
           aspect_type = { 'welzijn'}
           titel       = { 'welzijn'}
           waarde      =  { waarde }
           callBack_handleChangeDagWaarde = {callBack_handleChangeDagWaarde}
       />
    </>
  )  
}

export default Test_get_images