import { useState, useEffect,  useCallback} from 'react';
import { Modal, Table, Col, Row, Button} from "react-bootstrap";
import GetSliderButton from './GetSliderButton.jsx';
import propTypes from 'prop-types'; // ES6
import { v4 as uuidv4 } from 'uuid';

const  EditWaardeModal = (props) => {
    // const [id, setId] =  useState(1);
    // const [title, setTitle] =  useState("this song");
    const [show, setShow] = useState(false);

    const [aantalKnoppen]                 = useState([1,2,3,4,5])
    const [waarde, setWaarde]             = useState(props.waarde);
    const [oldWaarde, setOldWaarde]       = useState(props.waarde);
    const [opmerking, setOpmerking]       = useState(props.opmerking);
    const [oldOpmerking, setOldOpmerking] = useState(props.opmerking);

    /*   
      const handleSaveAndClose = () => { 
        handleSave();
        handleClose(); 
      }; 
    */
    
    async function update_or_create_hgh_waarneming_via_API(waarde1, opmerking1) {
      const postData = new FormData();
            //console.log('100 myUsers useffect 1 .. ')   
      postData.append('username'  , props.username);
      postData.append('apikey'    , props.apikey);
      postData.append('datum'     , props.datum);
      postData.append('aspect'    , props.aspect);
      postData.append('waarde'    , waarde1);
      postData.append('opmerking' , opmerking1);

      postData.append('action',  'update_or_create_hgh_waarneming');
  
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
      update_or_create_hgh_waarneming_via_API(waarde, opmerking)
      
      //props.callBackWaarde(2); // de naam van de geuploade file
    }

    const handleClose = () => { 
      // props.callBack();
      // if (!opmerking.localeCompare(props.opmerking)==0) {
    
      slaop()
      props.callBack_set_hgh_details()
      setShow(false);
       
      //props.callBackWaarde(2); // de naam van de geuploade file
    }
    
    const handleAnnuleer = () => { 
      // props.callBack_set_hgh_details()
      console.log('66: waarde voor..: ' + waarde)
      setWaarde(oldWaarde)
      setOpmerking(oldOpmerking)

      console.log('67: oldWaarde: ' + oldWaarde + " waarde na..: " + waarde)
      update_or_create_hgh_waarneming_via_API(oldWaarde, oldOpmerking); 
      setShow(false); 
    }

    const callBack_handleShow = useCallback(() => { 
      setShow(true)
    },[])

    const callBack_handleChangeWaarde = useCallback((nieuweWaarde) => {
      setWaarde (nieuweWaarde)
      // let result = update_waarde_via_API(nieuweWaarde);
      // console.log ('104: '+ result)
      // console.log (result)
      // handleClose()
      // wijzig waarde in de database, daarvoor heb je de username en api key nodg. Die haal je uit local storage.
      // props.callBackSetWaarde(props.aspect, props.datum, waarde, nieuweWaarde)
      //console.log('110: API aangeroepen') 
      //console.log(update_waarde_via_API()) 
    },[])

    useEffect(() => { 
      // 
    },  [show, props.waarde]) 

    useEffect(() => { 
      // console.log('!!! childcomponent is triggered')
    },  []) 

    return (
      <>

      {/* {console.log('79: editWaardeModal: '+  props.waarde) }  */}
        <GetSliderButton 
          aspect_type       = {props.aspect_type}
          icon              = {props.icon} 
          available_icons   = { props.available_icons }
          waarde            = {waarde} 
          size              = {'basic'} 
          callBack          = {callBack_handleShow}
        />

      {props.opmerking
        ? <div className = "x-small" >
            {props.opmerking.substr(0,5)+ '..'}
          </div>
        : ""
        }

        <Modal show={show} onHide={handleClose} active="true" centered backdrop={false}>
          <Modal.Header>
            <Modal.Title>
              Huidige waarde 
              <span className='space'></span>
              <span className='small'>aspect: {props.aspect}</span>       
              <span className='space'></span>
              <span className='small'>icon: {props.icon}</span>     
              <span className='space'></span> <br></br>

              <GetSliderButton 
                aspect_type     = {props.aspect_type} 
                icon            = {props.icon} 
                available_icons = {props.available_icons}
                waarde          = {waarde} 
                size            = {'large'} 
                callBack        = {callBack_handleChangeWaarde}
              />
              
            </Modal.Title>  
          </Modal.Header>
          <Modal.Body> 
          <div style={{'fontSize': 'large', 'fontWeight': '500','paddingBottom': '0.3rem'} }>Wijzig naar:</div>
            <Table striped bordered hover variant="light" size="sm" style={{'maxWidth': '15rem'}}>
              <tr key={uuidv4()}>  
                {/* {console.log('135: ' + props.aspect_type + '  ' + props.icon)}          */}
                {aantalKnoppen.map((waarde, index) => 
                    <td className='perc12' key={index}>         
                        <GetSliderButton 
                          aspect_type     = {props.aspect_type} 
                          icon            = {props.icon} 
                          available_icons = {props.available_icons}
                          waarde          = {waarde} 
                          size            = {'large'} 
                          callBack        = {callBack_handleChangeWaarde}
                        />
                    </td>
                )}
                <td className='perc12' key={uuidv4()}>
                <GetSliderButton 
                          key             = {'editwaarde0'}
                          aspect_type     = {props.aspect_type} 
                          available_icons = {props.available_icons}
                          icon            = {props.icon} 
                          waarde          = {0} 
                          size            = {'large'} 
                          callBack        = {callBack_handleChangeWaarde}
                        />
                </td>
              </tr>
            </Table>     
            <div style={{'fontSize': 'large', 'fontWeight': '500','paddingBottom': '0.3rem'} }> Opmerking: </div>
            <input type="text" 
              value= {opmerking} 
              size='50'
              onChange= {((event) => {setOpmerking(event.target.value)})}>         
            </input>    
                    
              {/* <UploadFile callback_uploadModal_fileChanged ={callback_uploadModal_fileChanged}/> */}
          </Modal.Body>
          <Modal.Footer>     
         

            <Button variant="primary" onClick={handleAnnuleer}>
              annuleer
              {/* props.selectedStart bevat de huidige filenaam*/ }
            </Button>
       
            <Button variant="primary" onClick={handleClose}>
              opslaan en sluiten
              {/* props.selectedStart bevat de huidige filenaam*/ }
            </Button>
            </Modal.Footer>
        </Modal>
      </>
    )
  }

  EditWaardeModal.propTypes = {
    //callBackWaarde: propTypes.number.isRequired
    callBack_set_hgh_details: propTypes.func,    
    username        : propTypes.string, 
    apikey 	        : propTypes.string, 
    aspect_type     : propTypes.string, 
    aspect          : propTypes.string, 
    icon            : propTypes.string, 
    available_icons : propTypes.array, 
    datum           : propTypes.string, 
    waarde          : propTypes.number,
    opmerking       : propTypes.string,
    fetchURL        : propTypes.string 
  }
  
  export default EditWaardeModal; 