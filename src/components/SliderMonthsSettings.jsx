// Disclaimer (manly about customStyles)
// this code is written with a lot of suggestions from chatGPT. They where not allways consistent
// Some best practice like using classes were not applyable, becouse the Bootstrap classes could not be altered
// on the other hand, some techniques like customStyles are interesting

import { useState, useEffect,  useCallback} from 'react';
import { Modal, Table, Col, Row, Button} from "react-bootstrap";

import propTypes from 'prop-types'; // ES6
import { v4 as uuidv4 } from 'uuid';
import Select from 'react-select';
import { IoSettingsOutline } from "react-icons/io5";


const  SliderMonthsSettings = (props) => {
    // const [id, setId] =  useState(1);
    // const [title, setTitle] =  useState("this song");
  const [show, setShow] = useState(false);


  
    async function update_or_create_hgh_waarneming_via_API(waardeDagdelenArray, opmerking1) { // dit zijn de aspect buttons, met een waarde
      
      // waardeDagdelenArray is een array [1,4,5,3,2]
      console.log('140: ')
      console.log(waardeDagdelenArray)
      const waardeDagdelenString = waardeDagdelenArray.map(digit => digit || 0).join('').padEnd(5, '0');
      
      const postData = new FormData();

            //console.log('100 myUsers useffect 1 .. ')   
      postData.append('username'            , props.username);
      postData.append('apikey'              , props.apikey);
      postData.append('datum'               , props.datum);
      postData.append('aspect'              , props.aspect);
      postData.append('dagwaardeBerekening' , props.dagwaardeBerekening);
      postData.append('waardeDagdelen'      , waardeDagdelenString);
      postData.append('opmerking'           , opmerking1);

      postData.append('action',  'update_or_create_hgh_waarneming_dagdelen');
  
      let requestOptions = {
        method: 'POST',
        body: postData,
      };
      const res = await fetch(props.fetchURL, requestOptions);   
      if (!res.ok) { throw res;}
      return res.json();
    } 

    const slaop = () => { 
      // props.callBack();
      // if (!opmerking.localeCompare(props.opmerking)==0) {
      update_or_create_hgh_waarneming_via_API(waardeDagdelen, opmerking)
    }
    
    const handleShow = () => setShow(true)

    const handleClose = () => { 
      // props.callBack();
      // if (!opmerking.localeCompare(props.opmerking)==0) {
    
      slaop()
      //props.callBack_set_hgh_details() 
      setShow(false);
       
      //props.callBackWaarde(2); // de naam van de geuploade file
    }
    
    const handleAnnuleer = () => { 
      // props.callBack_set_hgh_details()
      // console.log('66: waarde voor..: ' + waarde)
      // setWaarde(oldWaarde)
      // setOpmerking(oldOpmerking)

      // console.log('67: oldWaarde: ' + oldWaarde + " waarde na..: " + waarde)
      // update_or_create_hgh_waarneming_via_API(oldWaarde, oldOpmerking); 
      setShow(false); 
    }

    return (
      <div>
        <Button size="sm" >  <IoSettingsOutline/> </Button>
        
        <Modal contentClassName='modalBody' show={show} onHide={handleClose} active="true" centered backdrop={false}>
          <Modal.Header>
            <Modal.Title>
              Settings van de overzichts balk
              
            </Modal.Title>  
          </Modal.Header>
          <Modal.Body> 
            In de sliderbalk wordt: 
            <br/> -- het aspect benauwd weergegeven <b>per week</b>.
            <br/> -- de maanden staan er boven.

            <br/> -- de <b>hoogste waarde</b> van die week getoond. 
            <br/>
            <br/>Klik op een blokje om naar die week te gaan.           
          </Modal.Body>
          <Modal.Footer>     

          <Button variant="primary" onClick={handleAnnuleer}>
            sluit
            {/* props.selectedStart bevat de huidige filenaam*/ }
          </Button>
    
            {/*     
            <Button variant="primary" onClick={handleClose}>
              opslaan en sluiten
            </Button> */}
          </Modal.Footer>
        </Modal>
      </div>
    )
  }

  SliderMonthsSettings.propTypes = {
    //callBackWaarde: propTypes.number.isRequired
    callBack_from_settings: propTypes.func,    
    username              : propTypes.string, 
    apikey 	              : propTypes.string, 
    fetchURL              : propTypes.string 
  }
  export default SliderMonthsSettings; 