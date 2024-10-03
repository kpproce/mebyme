import {useState, useEffect, useCallback  } from 'react'
import Table from 'react-bootstrap/Table';
import propTypes from 'prop-types'; // ES6
import {basic_API_url} from './global_const.js'

const MyUsers = (props) => { 

   //  "http://localhost/waarnemingen/php/v39/beheer/beheerAstmaAppAPI.php"
  
  const fetchURL =   basic_API_url() + "php/mebyme.php"
  const avatarUrlPath = basic_API_url() + "src/assets/images/avatars"

  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");
  const [myUsers_message, setMyUsers_message] = useState("");

  const [username, setUsername] = useState(() => {
    let username = props.username
    return username ? username : 'guest' // standaard 
  })

  const [apikey, setApikey] = useState(() => {
    // let apikey = window.localStorage.getItem('apikey')
    let apikey = props.apikey
    return apikey ? apikey : 'geen' // standaard 
  })

  const [needToReload, setNeedToReload] = useState(() => {true})

  function callBack_myUsers_from_deleteUser(userMessage, value) {
    // console.log('24 callBack_myUsers_from_deleteUser ')
    // console.log('25: usermessage: ' + userMessage)
    setNeedToReload(true)
  }

  function callBack_myUsers_from_editRole(userMessage) {
    // console.log('34 callBack_myUsers_from_deleteUser ')
    // console.log('35: usermessage: ' + userMessage)
    setMyUsers_message(userMessage)
  }

  function handleData() {
    console.log('27: handle data')
  }

  const addButtons = (data) => {
    //let object_InfoButton = {  button: "<button onClick={ handleDeleteClick(row[1])>info</button>"}
    let object_InfoButton   = { button: 'infoButton'}
    let object_DeleteButon  = { button: 'deleteButton'}
    let object_Avatar       = { avatar: 'image'}
  
    data.forEach((row, index) => {
      if (row.innames == '0' && row.hoegaathet == '0' ) 
        data[index] = {...object_DeleteButon, ...object_Avatar, ...row}
        // row.action = 'leeg'// row.push({'acion': 'leeg'}) 
      else 
        data[index] = {... object_InfoButton, ...object_Avatar, ...row}
    });

    //console.log('59:  .. ')
    //console.log(data)   

    return data
  }

  async function getData() {
    const postData = new FormData();
    // console.log('100 myUsers useffect 1 .. ')   
    postData.append ('username_aanvrager', username);
    postData.append('api_aanvrager', apikey);
    postData.append('action', 'get_meta_accounts_1');

    let requestOptions = {
      method: 'POST',
      body: postData,
    };

    const res = await fetch(fetchURL, requestOptions);   
    if (!res.ok) { throw res;}
    return res.json();
  } 

  const handleInfoClick = (id) => {
    alert('info over ' + id)
  }

  useEffect (() => {
    getData()
    .then ((res) => {
      // console.log('105: res data opgehaald');
      // console.log(res);
      setMessage(res['messages'][0]);
      let users = addButtons(res['user_info'])
      setData(res['user_info']);
      // console.log("110: data: ")
      // console.log(data)
      handleData(data)
      setNeedToReload('false')
    })
  }, [username, apikey]) 


  useEffect (() => {
    // console.log('120 myUsers useffect 2 .. ')
    setUsername(props.username) // de username parent is gewijzigd
    setApikey(props.apikey) // de apikey parent is gewijzigd
    // console.log('120 myUsers useffect 3 .. ')
  }, [props.username, props.apikey]) 

  useEffect (() => { // voor de child component -> deleteUser
    if (needToReload == true) {
      // console.log('130: need to reload userdata  .. ')
      getData()
      .then ((res) => {
        setMessage(res['messages'][0]);
        //const users = addButtons(res['users'])
        //setData(users);
        handleData()
        setNeedToReload('false')
      })
    } 
  }, [needToReload])

  return (
    <>
      <div> versie 1.31_04 3 okt responsive betere max en kleuren per aspect_type </div>
      {/* {console.log('142:')} */}
      {/* {console.log(data)} */}
      <h2 className="smallTitle"> usergegevens, opgevraagd door {props.username}</h2> 
      <div>{myUsers_message}</div>
      {data?
        data[0]? 
          <>
            {/* {console.log('101: ' + needToReload)} */}
            <Table striped bordered hover variant="dark" size="sm"> 
              <thead>
                <tr>
                  {Object.keys(data[0]).map(header => <th key={header}>{header}</th>)}
                  {/* {console.log('154:')} */}
                  {/* {console.log(data)} */}
                </tr>
              </thead>
              <tbody>
                {data.map(item => Object.values(item)).map((row, index) => (
                  <tr key={index}>
                    {row.map((cell, index1) => 
                      <>
                        {cell == 'infoButton' 
                          ? <td key={index1}>
                              <button id={row[1]} onClick={() => handleInfoClick(row[1])}>I</button>
                            </td>
                          : <td key={index1}> {cell} </td>
                        }
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
            {message}
          </>
        : `${message}`
      : `${message}`
      }
      -{fetchURL}-
    </>
  );  
}

MyUsers.propTypes = {

  apikey: propTypes.string.isRequired,
  username: propTypes.string.isRequired,
  // callBack_myUsers_from_editRole: propTypes.func.isRequired
  }

export default MyUsers;