import { useState, useEffect,  useCallback} from 'react';
import { Modal, Table, Button} from "react-bootstrap";
import propTypes from 'prop-types'; // ES6
import { v4 as uuidv4 } from 'uuid';
import { IoIosAdd } from "react-icons/io";

const  EditOpmerkingModal = (props) => {

    // --------------------------------------
    // een opmerking komt uit de tabel opmerkingen en heeft 
    // -- een id (auto uniek)
    // -- een datum_start en een datum_einde
    // -- de opmerking zelf 
    // -- eventueel een aspect of aspect_type
    // -- een prior (1 --- x)

    // const [id, setId] =  useState(1);
    // const [title, setTitle] =  useState("this song");
    const [show, setShow] = useState(false);
    
    // de datums worden aangeleverd, die zijn ingevuld als beginen ne einddatum op je scherm
    const [datum_start, setDatum_start] = useState(props.datum_start);
    const [datum_einde, setDatum_einde] = useState(props.datum_einde);

    const [opmerking, setOpmerking] = useState(props.opmerking);
    const [gekozenAspect, setGekozenAspect] = useState('opmerking'); // standaard.


    const handleClose = () => { 
      // props.callBack();
      setShow(false); 
      //props.callBackOpmerking(2); // de naam van de geuploade file
    }

  /*   const handleSaveAndClose = () => { 
      handleSave();
      handleClose(); 
    }; */

    async function update_or_create_opmerking_via_API(nieuweOpmerking) { // dit zijn de losse opmerkingen
      const postData = new FormData();
            //console.log('100 myUsers useffect 1 .. ')   
      postData.append('username',       props.username);
      postData.append('apikey',         props.apikey);
      postData.append('datum_start',    datum_start);
      postData.append('datum_einde',    datum_einde);
      postData.append('aspect',         gekozenAspect);
      postData.append('opmerking',      nieuweOpmerking);
      postData.append('action',         'update_or_insert_opmerking');
  
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

    const handleSaveAndClose = () => { setShow(true)
      update_or_create_opmerking_via_API(opmerking)
      console.log ('51: '+ opmerking + ' aangepast')
      props.callBack_resetDataToRender()
      setShow(false); 
    }

    return (
      <>
      {/* {console.log('79: editOpmerkingModal: '+  props.opmerking) }  */}
  
        <span className = "x-small"  onClick={handleShow}>
          <span className='space'></span>
          <Button size="sm" > < IoIosAdd /> </Button>
        </span>

        <Modal contentClassName='modalBody' show={show} onHide={handleClose} active="true" centered backdrop={false}>
          <Modal.Header>
            <Modal.Title>
              nieuwe opmerking
            </Modal.Title>  
          </Modal.Header>
          <Modal.Body className='modalBody'> 

            <Table striped bordered hover size="sm" >
              {/* 
              <tr key={uuidv4()}>           
                <td key={uuidv4()} >aspect</td> 
                <td colSpan="2"  key={uuidv4()}>{props.aspect}</td>  
              </tr>
              */}
              <tr key={uuidv4()}>           
                <td key={uuidv4()} >
                  <input 
                    type="date" 
                    value={datum_start}
                    onChange= {((event) => {setDatum_start(event.target.value)
                    })} 
                  /> 

                </td>
                <td key={uuidv4()} >-</td> 
                <td key={uuidv4()} > 
                <input 
                    type="date" 
                    value={datum_einde}
                    onChange= {((event) => {setDatum_einde(event.target.value)
                    })} 
                  />
                </td>
              </tr>
              
            </Table>   
            <div style={{'fontSize': 'large', 'fontWeight': '500','paddingBottom': '0.3rem'} }> Opmerking: </div>
            <input type="text" 
              value= {opmerking} 
              size='42'
              onChange= {((event) => {setOpmerking(event.target.value)
                console.log('176: ' + opmerking)
              })}>         
            </input>          

              {/* <UploadFile callback_uploadModal_fileChanged ={callback_uploadModal_fileChanged}/> */}
          </Modal.Body>
          <Modal.Footer>     
            <Button variant="primary" onClick={handleSaveAndClose}>
              sla op en sluit
              {/* props.selectedStart bevat de huidige filenaam*/ }
            </Button>
            <Button variant="primary" onClick={handleClose}>
              annuleer
              {/* props.selectedStart bevat de huidige filenaam*/ }
            </Button>

            </Modal.Footer>
        
        </Modal>
      </>
    )
  }

  EditOpmerkingModal.propTypes = {
    //callBackOpmerking: propTypes.number.isRequired
    callBack_resetDataToRender: propTypes.func,    
    username       : propTypes.string, 
    apikey 	       : propTypes.string, 
    aspect         : propTypes.string, 
    datum_start    : propTypes.string, 
    datum_einde    : propTypes.string, 
    opmerking      : propTypes.string,
    fetchURL       : propTypes.string 
  }
  
  export default EditOpmerkingModal; 