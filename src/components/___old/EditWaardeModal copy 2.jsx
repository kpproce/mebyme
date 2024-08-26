import {useState, useEffect, useRef} from 'react';
import { Modal, Table, Col, Row, Button} from "react-bootstrap";
import PrintSmiley from './PrintSmiley.jsx';
import { FaUpload} from 'react-icons/fa';
import propTypes from 'prop-types'; // ES6

const  EditWaardeModal = (props) => {
    // const [id, setId] =  useState(1);
    // const [title, setTitle] =  useState("this song");
    const [show, setShow] = useState(false);

    const handleShow = () => { 
      setShow(true)
    }
    
    const [waarde, setWaarde] = useState(props.waarde);

    const handleClose = () => { 
      // props.callBack();
      setShow(false); 
      //props.callBackWaarde(2); // de naam van de geuploade file
    }

  /*   const handleSaveAndClose = () => { 
      handleSave();
      handleClose(); 
    }; */

    async function update_waarde_via_API(nieuweWaarde) {
      const postData = new FormData();
            //console.log('100 myUsers useffect 1 .. ')   
      postData.append('username', props.username);
      postData.append('apikey',   props.apikey);
      postData.append('datum',    props.datum);
      postData.append('aspect',   props.aspect);
      postData.append('waarde',   nieuweWaarde);
      postData.append('action',  'update_of_insert_waarde_1aspect');
  
      let requestOptions = {
        method: 'POST',
        body: postData,
      };
      const res = await fetch(props.fetchURL, requestOptions);   
      if (!res.ok) { throw res;}
      return res.json();
    } 

    const handleClick = (nieuweWaarde) => {
      setWaarde (nieuweWaarde)
      let result = update_waarde_via_API(nieuweWaarde);
      console.log (result)
      setShow(false); 
      // wijzig waarde in de database, daarvoor heb je de username en api key nodg. Die haal je uit local storage.

      props.callBackSetWaarde(props.aspect, props.datum, waarde, nieuweWaarde)
      //console.log('54: API aangeroepen') 
      //console.log(update_waarde_via_API()) 
    }

    useEffect(() => { 
      // 
    },  [show, props.waarde]) 

    useEffect(() => { 
      // console.log('!!! childcomponent is triggered')
    },  []) 

    const getClassName = (my_waarde) => {
      if ( my_waarde >=0 && my_waarde<=5 ) 
        return 'color_' + my_waarde
      else 
        return 'color_0'
    }  

    return (
      <>
      {/* {console.log('79: editWaardeModal: '+  props.waarde) }  */}
        <Button className={getClassName(waarde)}onClick={handleShow}>
          <PrintSmiley aspect_type={props.aspect_type} waarde={props.waarde}/>
        </Button>

        <Modal show={show} onHide={handleClose} active="true" backdrop={false}>
          <Modal.Header>
            <Modal.Title>
             <div className='small'>aspect: {props.aspect} datum: {props.datum} </div>
              <Button className={getClassName(waarde)} 
                      onClick={() => handleClick(waarde)}>
                <PrintSmiley aspect_type={props.aspect_type} waarde={waarde} />
              </Button>    
            </Modal.Title>  
          
          </Modal.Header>
          <Modal.Body> 
            <Button className={getClassName(1)} onClick={() => handleClick(1)}>
              <PrintSmiley aspect_type={props.aspect_type} waarde={1} />
            </Button>
            
            <Button className={getClassName(2)}onClick={() => handleClick(2)}>
              <PrintSmiley aspect_type={props.aspect_type} waarde={2} />
            </Button>
            
            <Button className={getClassName(3)}onClick={() => handleClick(3)}>
              <PrintSmiley aspect_type={props.aspect_type} waarde={3} />
            </Button>     
            
            <Button className={getClassName(4)}onClick={() => handleClick(4)}>
              <PrintSmiley aspect_type={props.aspect_type} waarde={4} />
            </Button>

            <Button className={getClassName(5)}onClick={() => handleClick(5)}>
              <PrintSmiley aspect_type={props.aspect_type} waarde={5} />
            </Button>
            <span className='width3px'></span>
            <Button className={getClassName(0)}onClick={() => handleClick(0)}>
              <PrintSmiley aspect_type={props.aspect_type} waarde={0} />
            </Button>

            {/* <UploadFile callback_uploadModal_fileChanged ={callback_uploadModal_fileChanged}/> */}
          </Modal.Body>
          <Modal.Footer>     
            {waarde}
            <Button variant="primary" onClick={handleClose}>
              cancel
              {/* props.selectedStart bevat de huidige filenaam*/ }
            </Button>
            </Modal.Footer>
        
        </Modal>
      </>
    )
  }

  EditWaardeModal.propTypes = {
    //callBackWaarde: propTypes.number.isRequired
    callBackSetWaarde: propTypes.func,    
    username    : propTypes.string, 
    apikey 	    : propTypes.string, 
    aspect_type : propTypes.string, 
    aspect      : propTypes.string, 
    datum       : propTypes.string, 
    waarde      : propTypes.number ,
    fetchURL    : propTypes.string 
  }
  
  export default EditWaardeModal; 