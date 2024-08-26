import {useState, useEffect, useCallback  } from 'react'
import Table from 'react-bootstrap/Table';
import DeleteUser from './deleteUser.jsx';
import EditUser from './editUser.jsx';
import EditRole from './editRole.jsx';




const MyUsers = (props) => { 

  const basic_API_url = basic_API_url()
  const fetchURL = "http://localhost/waarnemingen/php/v39/beheer/beheerAstmaAppAPI.php"
  const avatarUrlPath = "http://localhost/waarnemingen/images/avatars/"

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

  const [needToReload, setNeedToReload] = useState(() => {false})

  function callBack_myUsers_from_deleteUser(userMessage, value) {
    console.log('24 callBack_myUsers_from_deleteUser ')
    console.log('25: usermessage: ' + userMessage)
    setNeedToReload(true)
  }
  function callBack_myUsers_from_editRole(userMessage) {
    console.log('34 callBack_myUsers_from_deleteUser ')
    console.log('35: usermessage: ' + userMessage)
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

    console.log('59:  .. ')
    console.log(data)   
    

    return data
  }

  async function getData() {
    const postData = new FormData();
    console.log('100 myUsers useffect 1 .. ')   
    postData.append ('username_aanvrager', username);
    postData.append('api_aanvrager', apikey);
    postData.append('action', 'get_meta_accounts_compact');

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

  let loadImage = function(variable){
    var image = new Image();
    var url_image = './ImageFolder/' + variable + '.png';
    image.src = url_image;
    if (image.width == 0) {
      const img = "<img src='http://localhost/waarnemingen/images/avatars/noImg.png'/>" 
      return img
    } else {
      const img = "<img src='" + {avatarUrlPath} + {variable} + "/>" 
      return img
    }
  }

  useEffect (() => {
    getData()
    .then ((res) => {
      console.log('81: res data opgehaald');
      console.log(res);
      setMessage(res['messages'][0]);
      let users = addButtons(res['users'])
      setData(users);
      console.log("93: data: ")
      console.log(data)
      handleData()
      setNeedToReload('false')
    })
  }, [username, apikey]) 


  useEffect (() => {
    console.log('100 myUsers useffect 2 .. ')
    setUsername(props.username) // de username parent is gewijzigd
    setApikey(props.apikey) // de apikey parent is gewijzigd
    console.log('100 myUsers useffect 3 .. ')
  }, [props.username, props.apikey]) 

  useEffect (() => { // voor de child component -> deleteUser
    if (needToReload == true) {
      console.log('90: need to reload userdata  .. ')
      getData()
      .then ((res) => {
        setMessage(res['messages'][0]);
        const users = addButtons(res['users'])
        setData(users);
        handleData()
        setNeedToReload('false')
      })
    } else 
      console.log('90: DONT need to reload userdata  .. ')
  }, [needToReload])

  return (
    <> hello
      -{basic_API_url}-
    </>
  );  

}

MyUsers.propTypes = {

  // value: propTypes.string.isRequired,
  // callBack_myUsers_from_editRole: propTypes.func.isRequired
  }

export default MyUsers;