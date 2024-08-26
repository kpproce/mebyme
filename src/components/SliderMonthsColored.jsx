import {React, useState, useEffect, useCallback  } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

import {dateToTxt} from './utils.js'
import {get_changedDate_asTxt} from './utils.js'
// import {maandNamenKort} from './utils.js'
import {maandNamenKort} from './global_const.js'
import { v4 as uuidv4 } from 'uuid';

// import DeleteUser from './deleteUser.jsx';
// import EditUser from './editUser.jsx';
// import EditRole from './editRole.jsx';


const SliderMonthsColored = (props) => { 

  console.log('15: slider aangeroepen')

  // const fetchURL = "http://localhost/mebyme/php/mebyme.php"
  const fetchURL = "https://www.kimproce.nl/mebyme_php/mebyme.php"
  
  const showDebugMessages = false;
  const [hghData, setHghData] = useState([]);  //checken ... lijkt niet goed

  const [message, setMessage] = useState("");  
  const [myMessages, setMyMessages] = useState(["geen melding"]); // voor testen API

  const [username, setUsername] = useState(() => {
    let username = props.username
    return username ? username : 'guest' // standaard 
  })
  
  const [monthRow, setMonthRow] = useState([])

 const [hasToReloadData, setHasToReloadData ]= useState(false)

  var selectOptions = [];
  for (let i = 0; i < 6; i++) {
      selectOptions[i] = i;
  }

  const addNewMessage = (newMessage) => {
    const updatedMessages = [...myMessages, newMessage];
    setMyMessages(updatedMessages);
  };
  

  return (

      <Table key={uuidv4()} striped bordered hover  size="sm"> 
          <tbody>
            <tr key={uuidv4()}>
              { maandNamenKort.map(maandNaamKort =>
                <td key={uuidv4()}>
                  {maandNaamKort}
                </td>
              )}
            </tr>
          </tbody>
      </Table>  
  
  )
}

SliderMonthsColored.propTypes = {
  // value: propTypes.string.isRequired,
  // callBack_myUsers_from_editRole: propTypes.func.isRequired
}

  

export default SliderMonthsColored;