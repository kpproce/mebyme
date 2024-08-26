import {useState, useRef,  useEffect} from 'react';
import { Modal, Table, Button} from "react-bootstrap";
import propTypes from 'prop-types'; // ES6

import { FaEdit, FaTrash} from 'react-icons/fa';

function EditUser(props) {

  // ********************************************************
  // *****  niet meer in gebruik, want gebrui editRole  *****
  // ********************************************************

  const firstRenderRef = useRef(true);

  const [statusTekst, setStatusTekst] = useState("")  

  const fetchURL = "http://localhost/waarnemingen/php/v39/beheer/beheerAstmaAppAPI.php"

  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");


  const [username_aanvrager, setUsername_aanvrager] = useState(props.username_aanvrager)
  const [apikey_aanvrager, setApikey_aanvrager] = useState(props.apikey_aanvrager)  
  const [username_to_edit, setusername_to_edit] = useState(props.username_to_edit)
  const [role, set_role] = useState(props.role)

    // ----------------
    
    const handleShow = () => setShow(true)
    const handleClose = () => setShow(false)
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      } 
      
    };

    const getRoles = async () => {
      // maak form voor aanvraag, maar doie is niet nodig... 
      const postData = new FormData();
      postData.append('action', 'get_roles');

      // maak requestOPtions
      const requestOptions = {
        method: 'POST',
        body: postData,
      };

      // maak de call
      const response = await fetch(fetchURL, requestOptions);
      const data = await response.json();
      console.log(data)
    }


    const handleUpdate = () => {
      const postData = new FormData();
     
      postData.append ('username_aanvrager', username_aanvrager);
      postData.append('api_aanvrager', apikey_aanvrager);
      postData.append('username_to_edit', username_to_edit);
      postData.append('action', 'update_role');
  
      const requestOptions = {
        method: 'POST',
        body: postData,
      };

      console.log('92');
      
      const fetchData = async () => {
        try {
          /* const response = await fetch(fetchURL, requestOptions);
          const data = await response.json();
          setMessage(data.userMessage)
          if (data.removed) { 
            console.log('47: bevestiging edit uitgevoerd')
            props.callBack_myUsers_from_edit_User(`${props.username_to_edit} gewijzigd`, true)
            handleClose()
            setMessage('') // voor een volgende delete ..
          } */
        } catch (error) {
            console.log(`wijzigen ${username_to_edit} niet gelukt `, error);
        }
      }
      fetchData()
    }
 
    useEffect (() => {
      // getRoles()
    }, [show]) 


  return (
    <>

      <Button id={username_to_edit} variant="dark" onClick={handleShow}>
        <FaEdit size={25} />
      </Button>

      <Modal show={show} onHide={handleClose} active="true" backdrop={false}>
        <Modal.Header closeButton>
          <Modal.Title>
            Wijzig {username_to_edit} / {props.username_to_edit} door {username_aanvrager} <span className='x-small'> {apikey_aanvrager} </span> 
          
          </Modal.Title>
        </Modal.Header>
        <Modal.Body> 
        
        <div>
          <input className= "small" type="text"  
                        value = {role} 
                        onChange= {((event) => {setRole(event.target.value)})}
          />

          <Button variant="dark" onClick = {() => handleDelete()}>          
            Wijzig account {username_to_edit} 
            <span> </span> 
            <FaTrash size={30} />
          </Button>

        </div>
        {message}
    
        <div id="loginContainer">
                   
                 
        </div>
        </Modal.Body>
        <Modal.Footer>      
          <Button variant="primary" onClick={() => handleClose()}>
            Sluit
          </Button>{statusTekst} </Modal.Footer>
      </Modal>
    </>
  );
} 

// proptypes werkt nog niet helemaal 12 april 2024

// https://www.youtube.com/watch?v=SKqFMYOSy4g&ab_channel=LogRocket
// https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/prop-types.md

EditUser.propTypes = {

  username_aanvrager : propTypes.string.isRequired,
  apikey_aanvrager   : propTypes.string.isRequired,
  username_to_edit   : propTypes.string.isRequired,
  role               : propTypes.string.isRequired,

  callBack_myUsers_from_editUser: propTypes.func.isRequired
}

export default EditUser; 