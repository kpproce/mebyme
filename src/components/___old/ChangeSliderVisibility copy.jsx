import {useState, useEffect, useRef} from 'react';
import { Modal, Table, Col, Row, Button} from "react-bootstrap";
import PrintSmiley from './PrintSmiley.jsx';
import { FaUpload} from 'react-icons/fa';
import propTypes from 'prop-types'; // ES6

import { FaEdit} from 'react-icons/fa';
import { BsEye } from "react-icons/bs";
import { FaRegEyeSlash } from "react-icons/fa";

const  ChangeSliderVisibility = (props) => {
    // const [id, setId] =  useState(1);
    // const [title, setTitle] =  useState("this song");
    const [show, setShow] = useState(false);

    const handleShow = () => { setShow(true) }
    
    const [aspectLijst, setAspectLijst] = useState(props.aspectLijst);

    const handleClose = () => { setShow(false) }

  /*   const handleSaveAndClose = () => { 
      handleSave();
      handleClose(); 
    }; */

    async function update_bijInvoerTonen_via_API(aspect, bijInvoerTonen) {
      const postData = new FormData();
            //console.log('100 myUsers useffect 1 .. ')   
      postData.append('username', props.username);
      postData.append('apikey',   props.apikey);
      postData.append('aspect',   aspect);
      postData.append('bijInvoerTonen',   bijInvoerTonen);
      postData.append('action',  'update_aspect_bijInvoerTonen_1User');
  
      let requestOptions = {
        method: 'POST',
        body: postData,
      };
      const res = await fetch(props.fetchURL, requestOptions);   
      if (!res.ok) { throw res;}

      return res.json();
    } 

    useEffect(() => { 
      // 
    },  [show]) 

    const handleClick_visibilityChange_button = (aspect, bijInvoerTonen) => {
      update_bijInvoerTonen_via_API(aspect, bijInvoerTonen=='ja'?'kan':'ja') 
      props.callBack_changeSliderVisibility(true);
    }

    return (
      <>
        <Button onClick={handleShow}>
          <BsEye
            size="1.3rem"
            color=  "green"
          />
        </Button>

        <Modal show={show} onHide={handleClose} active="true" backdrop={false}>
          <Modal.Header>
            <Modal.Title>
              <div>
                Welke aspecten wil je zien? 
              
              </div>
              
            </Modal.Title>  
            <Button className="buttonRight" variant="primary" onClick={handleClose} > X </Button>
          </Modal.Header>
          <Modal.Body> 
            <Table key="avTable" striped bordered hover variant="light" size="sm">       
              <tr>
                <th key="av_h1">Type</th>
                <th key="av_h2">Aspect</th>
                <th key="av_h3">Tonen</th>
              </tr>     
              {props.aspectLijst.map((aspectDetails, aspectIndex) => 
                <>
                  <tr>
                    <td key="av_td1"> { aspectDetails.aspect_type } </td>
                    <td key="av_td2"> { aspectDetails.aspect }      </td>
                    <td key="av_td3"> { 
                      <Button
                        onClick={ 
                          () => handleClick_visibilityChange_button(aspectDetails.aspect, aspectDetails.bijInvoerTonen) 
                        }>
                      {aspectDetails.bijInvoerTonen=='ja'?
                          <BsEye
                            //style={{ padding_top: '0px'}}
                            size  = "1rem"
                            color = "green" 
                          />:
                          <FaRegEyeSlash
                            size  = "1rem"
                            color = "red" 
                          />
                        }     
                      </Button>
                    } </td>
                  </tr>
                </>
              )}
            
            </Table>

            {/* <UploadFile callback_uploadModal_fileChanged ={callback_uploadModal_fileChanged}/> */}
          </Modal.Body>
          <Modal.Footer>     
         
            <Button variant="primary" onClick={handleClose}>
              X
            </Button>
            </Modal.Footer>
        
        </Modal>
      </>
    )
  }

  ChangeSliderVisibility.propTypes = {
    aspectLijst   : propTypes.array, 
    username      : propTypes.string, 
    apikey 	      : propTypes.string, 
    aspect        : propTypes.string, 
    fetchURL      : propTypes.string,

    callBack_changeSliderVisibility : propTypes.func
  }
  
  export default ChangeSliderVisibility; 