import {useState, useRef,  useEffect} from 'react';
import {basic_API_url} from './global_const.js'
import {imageUrl} from './global_const.js'
import propTypes from 'prop-types'; // ES6

function Avatar(props) {
   
  const [username, setUsername] = useState(props.username)
  const [apikey] = useState(props.apikey)
  const [avatarName, setAvatarName] = useState(props.avatarName)


  const [file, setFile] = useState()
  const avatarUrlPath = imageUrl() + "avatars/"

  const [filename, setFilename] = useState("geen")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [userMessage, setUserMessage] = useState("")
  const [avatar_uploadMessage_className, setAvatar_uploadMessage_className] = useState('loginMessageNeutral small_italic')
  

  function handleFileChoosen(event) {
    setFile(event.target.files[0])
    console.log('tst 20: target en file:')
    console.log(event.target.files[0])
    console.log(file)
    // setFile("test")
    // console.log(file)
    setAvatarUrl(avatarUrlPath + username + ".png" + "?" + new Date().getTime()) 
    setFilename(event.target.files[0].name)
  }

  function handleUpload() {
    const fetchURL = "http://localhost/mebyme/php/mebyme.php"
      
    const formData = new FormData();
    formData.append('file', file);
    formData.append('imagePath', avatarUrlPath);
    formData.append('username', username);
    formData.append('apikey', apikey);
    formData.append('action', 'setAvatar');
    // formData.append('rename', username);
    
    console.log('tst 37: file:')
    console.log(file)

    const requestOptions = {
      method: 'POST',
      body: formData,
    };

    const fetchData = async () => {
      try {
        const res = await fetch(fetchURL, requestOptions);
        const response = await res.json();
 
        if (response.upload_ok) {
          props.setAvatarName(response.newAvatarImageName)
          setAvatarName(response.newAvatarImageName)
          setAvatar_uploadMessage_className('messageOkay small_italic')
        } else {
          setAvatar_uploadMessage_className('messageNotOkay small_italic')
        }
        setUserMessage(response.userMessage)
        console.log('tst 50: ')
        console.log(response)
        
      } catch (error) {
        console.log("tst 50: error", error);
      }

    }

    if (file) fetchData() // als de variabele file wijzigt dan direct ook uploaden

  }
  
  useEffect (() => { //
    console.log ('60: file or username changed.. ') 
    console.log(file)
    console.log(username)

    handleUpload()

  }, [file, username])

  return (
      <>
        {console.log(" 95: props.avatarName:" +  props.avatarName + " avatarName:" +  avatarName)}
        <img className='smallImg'
          key={filename}
          src={avatarUrlPath + avatarName }
          
          onError={({ currentTarget }) => {
            console.log('92: file load error' )
            console.log(currentTarget)
            console.log(" avatarUrl: " + avatarUrl)
          

            currentTarget.onerror = null; // prevents looping
            //currentTarget.src=noImgUrl;
          }} 
        />
        <br/>  
        <input type="file" onChange={handleFileChoosen}/> <br/>
        {/* filename: {filename} <br/> */}
        {userMessage.length > 0 
          ? <>
            <br/>
              <div className= {avatar_uploadMessage_className} >
                {userMessage} 
              </div>
            </>
          : ""
        }
      </>
  )
}

Avatar.propTypes = {
    username: propTypes.string.isRequired,
    apikey: propTypes.string.isRequired,
    avatarName: propTypes.string.isRequired,
    setAvatarName: propTypes.func.isRequired,

    // callBack_myUsers_from_editRole: propTypes.func.isRequired
}

export default Avatar; 