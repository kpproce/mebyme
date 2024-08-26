import {useState, useEffect, useRef} from 'react';
import { Modal, Button} from "react-bootstrap";
import { FaUpload} from 'react-icons/fa';
import propTypes from 'prop-types'; // ES6

function UploadModal(props) {
    const [show, setShow] = useState(false);
    // const [id, setId] =  useState(1);
    // const [title, setTitle] =  useState("this song");
    const [statusTekst, setStatusTekst] = useState("--");
    const [filename, setFilename] = useState(props.selectedStart);
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
      props.callBackFileUpload(filename); // d naam van de geuploade file
    };

  /*   const handleSaveAndClose = () => { 
      handleSave();
      handleClose(); 
    }; */

    const callback_uploadModal_fileChanged  = (filename) => { 
      // toegevoegd mei 2022 kies img uit map images/silvermusic/huusband2 or huusband1
      setFilename(filename);
    };

    const handleChangeInput = (e) => {
      // e.persist() // kan waarsch weg obsolate
      setFilename(e.target.value)
    }

    useEffect(() => { 
      // inputFile.current.click()
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

       
            {/* <UploadFile callback_uploadModal_fileChanged ={callback_uploadModal_fileChanged}/> */}
          </Modal.Body>
          <Modal.Footer>     
            <Button variant="primary" onClick={handleClose}>
              sluit
              {/* props.selectedStart bevat de huidige filenaam*/ }
            </Button>{statusTekst} </Modal.Footer>
        </Modal>
      </>
    );

              }
  
  UploadModal.propTypes = {
    selectedStart: propTypes.string.isRequired,
  }
  
  export default UploadModal; 