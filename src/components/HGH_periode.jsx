import {useState, useEffect, useCallback  } from 'react'
import Table from 'react-bootstrap/Table';
import {basic_API_url} from './global_const.js'
// import DeleteUser from './deleteUser.jsx';
// import EditUser from './editUser.jsx';
// import EditRole from './editRole.jsx';


const HGH_periode = (props) => { 

  const fetchURL =   basic_API_url() + "php/mebyme.php"


  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");

  const [username, setUsername] = useState(() => {
    let username = props.username
    return username ? username : 'guest' // standaard 
  })

  const [apikey, setApikey] = useState(() => {
    // let apikey = window.localStorage.getItem('apikey')
    let apikey = props.apikey
    return apikey ? apikey :'guestapikey2' // standaard 
  })

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
    postData.append ('username', username);
    postData.append('apikey', apikey);

    postData.append('action', 'get_HGH_periode');

    let requestOptions = {
      method: 'POST',
      body: postData,
    };

    const res = await fetch(fetchURL, requestOptions);   
    if (!res.ok) { throw res;}
    return res.json();
  } 

  useEffect (() => {
    getData()
    .then ((res) => {
      console.log('81: res data opgehaald')
      console.log(res)
      console.log(res['hghPeriode']['data'])
      setMessage(res['hghPeriode']['messages'][0])
      let hgh_Periode = addButtons(res['hghPeriode']['data'])
      setData(hgh_Periode)
      console.log("93: data: ")
      console.log(data)
    })
  }, []) 

  


  return (
    <>
      <h2 className="smallTitle">  {props.username} data:</h2> 
      <div>Hoe gaat het data</div>
      {data?
        data[0]? 
          <>
            <Table striped bordered hover variant="dark" size="sm"> 
              <thead>
                <tr>
                  {Object.keys(data[0]).map(header => <th key={header}>{header}</th>)}
                  {console.log('137:')}
                  {console.log(data)}
                </tr>
              </thead>
              <tbody>
                {data.map(item => Object.values(item)).map((row, index) => (
                  <tr key={index}>
                    {row.map((cell, index1) => 
                    
                    <td key={index1}>
                      {cell}
                    </td>)          
                  }
                  </tr>
                ))}
              </tbody>
            </Table>
            {message}
          </>
        : `${message}`
      : `${message}`
        
      }

    </>
  );  

}

HGH_periode.propTypes = {

  // value: propTypes.string.isRequired,
  // callBack_myUsers_from_editRole: propTypes.func.isRequired
  }

export default HGH_periode;