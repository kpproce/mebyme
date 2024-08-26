import {useState, useEffect, useRef} from 'react';
import { Modal, Table, Col, Row, Button} from "react-bootstrap";
import { FaUpload} from 'react-icons/fa';
import propTypes from 'prop-types'; // ES6


function EditWaardeModal_oud(props) {
    const [show, setShow] = useState(false);
    // const [id, setId] =  useState(1);
    // const [title, setTitle] =  useState("this song");
    const [statusTekst, setStatusTekst] = useState("--");
    const handleShow = () => { 
    setShow(true)

    }
    const inputFile = useRef(null) 

    let updateUrl=""
    const hostName = window.location.host
  
    if (hostName.includes("localhost")) 
      updateUrl = "http://localhost/php_api_test/apiBasic/updateSongV2.php";
    else 
      updateUrl = "https://silvermusic.nl/test/apiBasic/updateSongV2.php";

    const requestOptions = {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      }
    };

  /*   const handleSave = () => {
      setStatusTekst("saved")
      props.callBackImageUpload("a.png");
    } */

    const handleClose = () => { 
      // props.callBack();
      setShow(false); 
      props.callBackWaarde(2); // de naam van de geuploade file
    };

  /*   const handleSaveAndClose = () => { 
      handleSave();
      handleClose(); 
    }; */

  
    const handleChangeInput = (e) => {
      // e.persist() // kan waarsch weg obsolate
      alert('waare  aangepast')
    }

    useEffect(() => { 
      // 
    },  [show]) 

    return (
      <>
        <Button variant="dark" onClick={handleShow}>
          <FaUpload size={20} style={{ color: 'white' }} />
          <input type="file" name="picture"  ref={inputFile} onChange={handleChangeInput}/> 
          <span className="small"> </span> 
        </Button>
        {" "}
  
        <Modal show={show} onHide={handleClose} active="true" backdrop={false}>
          <Modal.Header>
            <Modal.Title>Upload file</Modal.Title>
          </Modal.Header>
          <Modal.Body> 
            <Button variant="primary" onClick={handleClicked}>
                kies
            </Button>

            {/* <UploadFile callback_uploadModal_fileChanged ={callback_uploadModal_fileChanged}/> */}
          </Modal.Body>
          <Modal.Footer>     
            <Button variant="primary" onClick={handleClose}>
              sluit
              {/* props.selectedStart bevat de huidige filenaam*/ }
            </Button>
              {statusTekst} 
            </Modal.Footer>
        </Modal>
      </>
    );

  }

  EditWaardeModal.propTypes = {
    callBackWaarde: propTypes.number.isRequired
  }
  
  export default EditWaardeModal; 