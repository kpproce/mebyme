import {useState, useRef,  useEffect} from 'react';
import propTypes from 'prop-types'; // ES6
import { Modal, Table, Col, Row, Button} from "react-bootstrap";
import { FaEdit} from 'react-icons/fa';
import { BsEye } from "react-icons/bs";
import {basic_API_url} from './global_const.js'
import NewApikeyModal from './NewApikeyModal.jsx'
import {imageUrl} from './global_const.js'

import  Avatar  from "./avatar.jsx";


function LoginModal(props) {

  // const firstRenderRef = useRef(true);

  // const inputRef = useRef(); // because of the fake input in the React virtuel DOM..

  // const [t, setT] = useState("geen")  


  
  const [statusTekst, setStatusTekst] = useState("")  
  const fetchURL =   basic_API_url() + "php/mebyme.php"

  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("-");
  const [userMessage, setUserMessage] = useState("-");
  const [userMessageStyle, setUserMessageStyle] = useState("messageALertStyle");

  const [username, setUsername] = useState(() => {
    let username = window.localStorage.getItem('username')
    return username ? username : 'guest' // standaard 
  })

  const avatarUrlPath = imageUrl() + "avatars/"
  const [avatarName, setAvatarName] = useState('noImg.png')
  
  const [usernameOrg, setUsernameOrg] = useState(username) 
  const [password, setPassword] = useState("")

  const [apikey, setApikey] = useState(() => {
    const apikeyT = window.localStorage.getItem('apikey')
    return apikeyT ? apikeyT : 'no_apikey' // standaard 
  })

  const [askForNewApi, setAskForNewApi] = useState(null)
  const [username_password_correct, setUsername_password_correct] = useState(false)

  const [loggedIn, setLoggedIn] = useState(false)
  const [loginIcon_style, setLoginIcon_style] = useState("loginIcon_falseStyle")  
  const [apikey_or_password, setApikey_or_password] = useState("apikey")  

  const [loginMessageClassName, setloginMessageClassName] = useState('loginMessageNeutral small_italic')

  const saveUsername = (username) => {
   // setApikey(username)
    window.localStorage.setItem('username', username)
  }

  const saveApikey = (apikey_value) => {
    

    // console.log("61 in: apikey_value: "+ apikey_value + " const apikey: " + apikey)
    window.localStorage.setItem('apikey', apikey_value)
    setApikey(apikey_value)
}

  const [inputType, setInputType] = useState('apikey');
  const toggleInputType = () => {
      setInputType(inputType === 'password' ? 'text': 'password')
  };
  
  // ----------------

  const callBackLoginNewApi = (newApikey, newMessage) => {
    saveApikey(newApikey)
    setUserMessage(newMessage)
    setAskForNewApi(false)
    setLoginIcon_style('loginIcon_alertStyle')
  }

  const handleShow = () => setShow(true)
  const handleClose = () => { setShow(false)}
  
  const login = () => {
    const postData = new FormData();
  
    postData.append ('username', username);
    postData.append('password', password);
    // console.log('71: apikey ')

    // console.log(apikey)
    postData.append('apikey', apikey);
  
    if (password.length<1) 
      postData.append('apikey_or_password', 'apikey')
    else 
      postData.append('apikey_or_password', apikey_or_password)
  
    postData.append('action', 'login');

    
    const requestOptions = {
      method: 'POST',
      body: postData,
    };

    const fetchData = async () => {
      try {
        const response = await fetch(fetchURL, requestOptions);
        const data = await response.json();
        // console.log('113: data received')
        // console.log(data)
        // console.log('103: data.username: ' , data.username +  ' data.apikey: ' + data.apikey + '{data.logged_in}' )
        saveUsername(data.username)
        setUsernameOrg(data.username)
        setLoggedIn(data.logged_in)
       
        setUsername_password_correct(data.username_password_correct)
        setAskForNewApi(data.askForNewApi)
        setUserMessage(data.userMessage)
        // console.log('123: ' + (data.username_password_correct
        //   ?'username_password_correct'
        //   :data.logged_in?'apiKey used, not loged in via username/password': 'username_password NOT correct'))
        // console.log('124: data.apikey_fromDB: ' + data.apikey_fromDB )
       
        if (data.logged_in) {
          setUserMessageStyle ('messageOkayStyle')
          saveApikey(data.apikey_fromDB)
          saveUsername(username)
          setAvatarName(data.avatar) // the name of the avatar image
          // console.log('130: logged in OK: apikey: ' + data.apikey + ' - resultmess: ' + data.result_message)
          setUserMessageStyle ('messageOkayStyle')
          setLoginIcon_style('loginIcon_okayStyle')
          // handleClose()
          setloginMessageClassName('messageOkay small_italic')


        } else {
          if (!data.username_password_correct) {
            saveApikey(data.apikey_fromDB)
            console.log('139: apikey (is waarschijnlijk null) opgeslagen')
            setUserMessageStyle ('messageOkayStyle')
          }
          setloginMessageClassName('messageNotOkay medium_italic')
          setLoginIcon_style('loginIcon_falseStyle')
          setUserMessageStyle ('messageALertStyle')
        }
        // console.log('140: data')
        // console.log(data)

        props.callBackNavBarFromLogin(data.username, data.apikey_fromRequest, data.logged_in)

      } catch (error) {
          alert('server not available, of bug in mebyme.php, zie error in console (130:)')
          console.log("130: error", error);
      }
    }
    fetchData()
  }

  useEffect (() => {
    login() // eenmalig inloggen met APIKey
    setApikey_or_password ('password') 
  }, []) 

  return (
    <>
      <Button variant="dark" size="small" sx={{ p: 2 }} onClick={handleShow}>
        <FaEdit size={25} className = {loginIcon_style} />
          {usernameOrg}
          {/* {console.log('143: avatarUrl: '+ avatarUrlPath + avatarName)} */}
         <img className='picto' src = {avatarUrlPath + avatarName}/>
         {loggedIn?"":message}
      </Button>

      <Modal className='modal1' show={show} onHide={handleClose} active="true" backdrop={false}>
        <Modal.Header closeButton>
          <Modal.Title>
            login {username}:  <span className='x-small'>{basic_API_url()}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body> 
       
        <Table responsive striped bordered="true" hover size="sm" variant = "dark">
              <thead> 
                <tr><th width={'14%'}> item </th><th> item </th></tr>
              </thead>
              <tbody>
                <tr>
                  <td> username:</td>
                  <td>
                    <input className= "small" type="text"  
                      value = {username} 
                      onChange= {((event) => {setUsername(event.target.value)})}
                    />
                  </td>
                </tr>
                <tr>
                  <td> password:</td>
                  <td>
                    <input className= "small" 
                      value =   {password}
                      type =    {inputType}
                      onChange= {((event) => {setPassword(event.target.value)})}
                    />
                    <Button onClick={toggleInputType} className="m-1 p-0 border border-red px-1 mt-0" >
                      <BsEye
                          style={{
                            padding_top: '0px'
                          }}
                          size = "1.3rem"
                          color = { inputType=="text" ? "green" :"red"}
                      />
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td> apikey: <br></br><span className='x-small grey'> niet wijzigbaar</span></td>
                  <td>
                    <span className='small'>{apikey} </span>
                  </td>
                </tr>
               
                <tr>
                <td> </td>
                  <td>
                    {/* <Button onClick={() => cancel()} className="m-1 p-0 border border-red px-1 mt-0" >     
                        annuleer
                    </Button> */}
 
                    <Button onClick={() => login()} className="m-1 p-0 border border-red px-1 mt-0" >     
                      {message=="apikey verlopen"? 'login eenmalig zonder Apikey': 'login' } 
                    </Button>
                  </td>
                </tr>  
             
                <tr>
                <td> </td>
                  <td colSpan={2} className= {loginMessageClassName} >
                    {askForNewApi 
                      ? <NewApikeyModal  
                          username  = { username }
                          password  = { password }     // kan leeg zijn
                          // newApikey = { apikey }       // kanfout of leeg of verlopen zijn
                          callBackLoginNewApi = {callBackLoginNewApi}
                        />
                      : <div className={userMessageStyle}>
                          {userMessage}
                        </div> 
                    }
                  </td>
                </tr>
             
              </tbody>
        </Table>

        <div className='small grey'>avatarUrlPath:{avatarUrlPath} </div>     
        
        {loggedIn || username_password_correct 
          ? <Table responsive striped bordered="true" hover size="sm" variant = "dark">
              <tbody>
                <tr>
                  <td width={'18%'}> avatar</td>
                  <td>
                    < Avatar username={username} avatarName={avatarName}  apikey={apikey} setAvatarName={setAvatarName}  />
                  </td>
                </tr>
            
              </tbody>
            </Table>
          : ""
        }

        <div id="loginContainer">
                             
        </div>
        </Modal.Body>
        <Modal.Footer>      
          <Button variant="primary" onClick={() => handleClose()}>
            X
          </Button>{statusTekst} </Modal.Footer>
      </Modal>
    </>
  );
} 

LoginModal.propTypes = {
  callBackNavBarFromLogin: propTypes.func.isRequired
  // value: propTypes.string.isRequired,
  // callBack_myUsers_from_editRole: propTypes.func.isRequired
  }


export default LoginModal; 