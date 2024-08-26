import {useState, useRef,  useEffect} from 'react';
import { Modal, Button} from "react-bootstrap";
import propTypes from 'prop-types'; // ES6

import { FaTrash} from 'react-icons/fa';

function DeleteUser(props) {

  const firstRenderRef = useRef(true);

  const [statusTekst, setStatusTekst] = useState("")  

  const fetchURL = "http://localhost/waarnemingen/php/v39/beheer/beheerAstmaAppAPI.php"

  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");

  const [username_to_delete, setUsername_to_delete] = useState(props.username_to_delete)
  const [username_aanvrager, setUsername_aanvrager] = useState(props.username_aanvrager)
  const [apikey_aanvrager, setApikey_aanvrager] = useState(props.apikey_aanvrager)  

    // ----------------
    
    const handleShow = () => setShow(true)
    const handleClose = () => setShow(false)
    
    const handleDelete = () => {
      const postData = new FormData();
     
      postData.append ('username_aanvrager', username_aanvrager);
      postData.append('api_aanvrager', apikey_aanvrager);
      postData.append('username_to_remove', username_to_delete);
      postData.append('action', 'remove_account');
  
      const requestOptions = {
        method: 'POST',
        body: postData,
      };

      console.log('92');
      
      const fetchData = async () => {
        try {
          const response = await fetch(fetchURL, requestOptions);
          const data = await response.json();
          setMessage(data.userMessage)
          if (data.removed) { 
            console.log('47: bevestiging verwijderen uitgevoerd')
            props.callBack_myUsers_from_deleteUser(`${props.username_to_delete} verwijderd`, true)
            handleClose()
            setMessage('') // voor een volgende delete ..
          }
        } catch (error) {
            console.log(`verwijderen ${username_to_delete} niet gelukt `, error);
        }
      }
      fetchData()
    }
 
    useEffect (() => {
      setUsername_to_delete(props.username_to_delete)
      // niet n gebruik voor dit component

    }, [props.username_to_delete]) 


  return (
    <>

      <Button id={username_to_delete} variant="dark" onClick={handleShow}>
        <FaTrash size={30} />
     
        {/* // class="fas fa-pencil-alt fa-fw" */}

      </Button>

      <Modal show={show} onHide={handleClose} active="true" backdrop={false}>
        <Modal.Header closeButton>
          <Modal.Title>
            Verwijder {username_to_delete} / {props.username_to_delete} door {username_aanvrager} <span className='x-small'> {apikey_aanvrager} </span> 
          
          </Modal.Title>
        </Modal.Header>
        <Modal.Body> 
        
        <div>
          
          <Button variant="dark" onClick = {() => handleDelete()}>
            Verwijder account {username_to_delete} 
            <span> </span> 
            <FaTrash size={25} />
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


// https://www.youtube.com/watch?v=SKqFMYOSy4g&ab_channel=LogRocket
// https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/prop-types.md
DeleteUser.propTypes = {
  username_to_delete: propTypes.string.isRequired,
  username_aanvrager: propTypes.string.isRequired,
  apikey_aanvrager: propTypes.string.isRequired,
  callBack_myUsers_from_deleteUser: propTypes.func.isRequired
}

export default DeleteUser; 