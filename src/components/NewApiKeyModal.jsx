import {useState, useRef,  useEffect} from 'react';
import propTypes from 'prop-types'; // ES6
import { Modal, Table, Col, Row, Button} from "react-bootstrap";
import { FaEdit} from 'react-icons/fa';
import { BsEye } from "react-icons/bs";
import {basic_API_url} from './global_const.js'


function NewApikeyModal(props) {
  const fetchURL =   basic_API_url() + "php/mebyme.php"
  const [show, setShow] = useState(false);
  const [userCode, setUserCode] = useState("123456");
  const [message, setMessage] = useState("");
  const [newApikey, setNewApikey] = useState ("");
  const saveApikey = (apikey_value) => {
    // console.log("48 apikey set na: "+ apikey + " " + apikey_value)
    window.localStorage.setItem('apikey', apikey_value)
  }
   
    // ----------------
    
    const fetchInitialData = async () => {
      const postData = new FormData()  
      console.log('24: props')
      console.log(props)
      postData.append ('username', props.username)
      postData.append('password', props.password)
      // console.log('71: apikey ')
  
      postData.append('action', 'getCodeForNewApikey')

      const requestOptions = { method: 'POST', body: postData }
     
      try {
        const response = await fetch(fetchURL, requestOptions)
        const data = await response.json()
        console.log('43: data from apikeyCode')
        console.log(JSON.stringify(data))
        console.log('einde data')
        //
        //
        setMessage(data.userMessage)
        // console.log('103: data.username: ' , data.username +  ' data.apikey: ' + data.apikey + '{data.logged_in}')
  
      } catch (error) {
          alert('server not available, of bug in mebyme.php, zie error in console (60:)')
          console.log("60: error", error);
      }
    }

    const fetchUserCode = async () => {
      const postData = new FormData();  
      postData.append ('username', props.username);
      postData.append('password', props.password);
      postData.append('userCode', userCode);
      postData.append('duration_days', 60); 
      // console.log('71: apikey ')
  
      postData.append('action', 'setNewApikey_with_userCode');

      const requestOptions = { method: 'POST', body: postData };
     
      try {
        const response = await fetch(fetchURL, requestOptions);
        const data = await response.json();
        console.log('66: data from apikeyCode')
        console.log(data)
        setMessage(data.userMessage)
        console.log('69: newApikey: ' +  data.newApikey) 
        setNewApikey(data.newApikey)
        props.callBackLoginNewApi(data.newApikey, data.userMessage)
        // console.log('103: data.username: ' , data.username +  ' data.apikey: ' + data.apikey + '{data.logged_in}')
  
      } catch (error) {
          alert('server not available, of bug in mebyme.php, zie error in console (60:)')
          console.log("60: error", error);      
      }
    }
    
    const getCodeForNewApikey = () => {
      fetchData()
    }

    const handleShow = () => {
      fetchInitialData()
      setShow(true)
    }

    const handleSaveAndClose = () => {
      //console.log('60: LoginModal -> handle close : username: ' + username + " apikey: " + apikey)
     
      fetchUserCode() // create and get new apikey 

      setShow(false)
    }
   
    const handleClose = () => {
      //console.log('60: LoginModal -> handle close : username: ' + username + " apikey: " + apikey)
      // props.callBackNavBarFromLogin(username, apikey)
      setShow(false)
    }
   

    useEffect (() => {
     
    }, []) 

  return (
    <>
      <Button variant="warning" size="small" sx={{ p: 2 }} onClick={handleShow}>
        Apikey verlopen, vraag nieuwe aan
      </Button>

      <Modal className='modal2' show={show} onHide={handleClose} active="true" backdrop={false}>
        <Modal.Header closeButton>
          <Modal.Title>
            Apikey verlopen, vraag nieuwe aan voor: {props.username}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body > 
          Vul hier de toegestuurde code (6 cijfers) in.<br/> 
          <input className= "invoerBC" 
            type="text" 
            maxLength="6" 
            onInput={(e) => (e.target.value = e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 6-digit code" 
            value    = {userCode} 
            onChange = {((event) => {setUserCode(event.target.value)})}
          />
          password: {props.password}
          <div className='xx-small'> 
            <br/>
            {newApikey}
            {message}
          </div>
        </Modal.Body>
        <Modal.Footer>     
          <Button variant="primary" onClick={() => handleSaveAndClose()}>
            opslaan
          </Button>  
          <Button variant="secondary" onClick={() => handleClose()}>
            X
          </Button> 
        </Modal.Footer>
      </Modal>
    </>
  );
} 

NewApikeyModal.propTypes = {
  
  username: propTypes.string.isRequired,
  callBackLoginNewApi: propTypes.func.isRequired
  // value: propTypes.string.isRequired,
  // callBack_myUsers_from_editRole: propTypes.func.isRequired
  }

export default NewApikeyModal; 