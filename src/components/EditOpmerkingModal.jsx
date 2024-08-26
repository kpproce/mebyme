import { useState, useEffect,  useCallback} from 'react';
import { Modal, Table, Button} from "react-bootstrap";
import propTypes from 'prop-types'; // ES6
import { v4 as uuidv4 } from 'uuid';

const  EditOpmerkingModal = (props) => {
    // const [id, setId] =  useState(1);
    // const [title, setTitle] =  useState("this song");
    const [show, setShow] = useState(false);

    const [aantalKnoppen] = useState([1,2,3,4,5])
    
    const [opmerking, setOpmerking] = useState(props.opmerking);

    const handleClose = () => { 
      // props.callBack();
      setShow(false); 
      //props.callBackOpmerking(2); // de naam van de geuploade file
    }

  /*   const handleSaveAndClose = () => { 
      handleSave();
      handleClose(); 
    }; */

    async function update_opmerking_via_API(nieuweOpmerking) {
      const postData = new FormData();
            //console.log('100 myUsers useffect 1 .. ')   
      postData.append('username', props.username);
      postData.append('apikey',   props.apikey);
      postData.append('datum',    props.datum);
      postData.append('aspect',   props.aspect);
      postData.append('opmerking',   nieuweOpmerking);
      postData.append('action',  'update_of_insert_opmerking_1aspect');
  
      let requestOptions = {
        method: 'POST',
        body: postData,
      };
      const res = await fetch(props.fetchURL, requestOptions);   
      if (!res.ok) { throw res;}
      return res.json();
    } 
    
    const handleShow = () => setShow(true)

    const callBack_handleShow = useCallback(() => { 
      setShow(true)
    },[])

    const callBack_handleChangeOpmerking = useCallback((nieuweOpmerking) => {
      setOpmerking (nieuweOpmerking)
      let result = update_opmerking_via_API(nieuweOpmerking);

      console.log ('51: '+ result)
      console.log (result)
      setShow(false); 
      // wijzig opmerking in de database, daarvoor heb je de username en api key nodg. Die haal je uit local storage.

      props.callBackSetOpmerking(props.aspect, props.datum, opmerking, nieuweOpmerking)
      //console.log('54: API aangeroepen') 
      //console.log(update_opmerking_via_API()) 
    },[])

    useEffect(() => { 
      // 
    },  [show, props.opmerking]) 

    useEffect(() => { 
      // console.log('!!! childcomponent is triggered')
    },  []) 

    return (
      <>
      {/* {console.log('79: editOpmerkingModal: '+  props.opmerking) }  */}
  
        <div className = "x-small"  onClick={handleShow}>
          {props.opmerking.substr(0,8)}
        </div>

        <Modal show={show} onHide={handleClose} active="true" centered backdrop={false}>
          <Modal.Header>
            <Modal.Title>
            {props.opmerking}    
              <span className='space'></span>
         
            </Modal.Title>  
          </Modal.Header>
          <Modal.Body> 
          <div style={{'fontSize': 'large', 'fontWeight': '500','paddingBottom': '0.3rem'} }>Wijzig naar:</div>
            <Table striped bordered hover variant="light" size="sm" style={{'maxWidth': '15rem'}}>
              <tr key={uuidv4()}>           
                {aantalKnoppen.map((opmerking, index) => 
                    <td className='perc12' key={index}>
 
                    </td>
                )}
                <td className='perc12' key={uuidv4()}>
                </td>
              </tr>
            </Table>         

              {/* <UploadFile callback_uploadModal_fileChanged ={callback_uploadModal_fileChanged}/> */}
          </Modal.Body>
          <Modal.Footer>     
            <Button variant="primary" onClick={handleClose}>
              sluit
              {/* props.selectedStart bevat de huidige filenaam*/ }
            </Button>
            </Modal.Footer>
        
        </Modal>
      </>
    )
  }

  EditOpmerkingModal.propTypes = {
    //callBackOpmerking: propTypes.number.isRequired
    callBackSetOpmerking: propTypes.func,    
    username    : propTypes.string, 
    apikey 	    : propTypes.string, 
    aspect_type : propTypes.string, 
    aspect      : propTypes.string, 
    datum       : propTypes.string, 
    opmerking   : propTypes.string,
    fetchURL    : propTypes.string 
  }
  
  export default EditOpmerkingModal; 