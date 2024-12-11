import { useState, useMemo, useEffect,  useCallback} from 'react';
import { Modal, Table, Col, Row, Button} from "react-bootstrap";
import GetSliderButton from './GetSliderButton.jsx';
import {basic_API_url} from './global_const.js'
import GetIcon from './GetIcon.jsx';
import { FaSmile, FaFrown, FaMeh, FaAngry } from 'react-icons/fa';
import { FaBlind, FaMinus, FaCheck, FaPlus, FaRegCircle } from 'react-icons/fa';


import { FaUserFriends, FaUserNinja,FaUserSecret,FaUserTie, FaChair, FaBed, FaWalking, FaRunning, FaBiking, FaSkiingNordic } from 'react-icons/fa';
import { ImSleepy } from "react-icons/im";

import propTypes from 'prop-types'; // ES6
import { v4 as uuidv4 } from 'uuid';
import Select from 'react-select';

const  EditWaardeDagdelenModal = (props) => {
    // const [id, setId] =  useState(1);
    // const [title, setTitle] =  useState("this song");
    const [show, setShow] = useState(false);
    const fetchURL =   basic_API_url() + "php/mebyme.php"
    
    const [dagdelen, setDagdelen] = useState([
      { naam: 'nacht', waarde: 0 },
      { naam: 'opstaan', waarde: 0 },
      { naam: 'morgen', waarde: 0 },
      { naam: 'middag', waarde: 0 },
      { naam: 'avond', waarde: 0 }
    ]);
    

    const [waarde, setWaarde] = useState(props.waarde);
    const [teller, setTeller] = useState(0);
    const [waardeDagdelenArray, setWaardeDagdelenArray] = useState(['0','0','0','0','0']) // standaard 
    const [selectedValue, setSelectedValue] = useState(3)
    const [dagdelenInvullen, setDagdelenInvullen] = useState("ja")
    const [dagwaardeBerekening, setDagwaardeBerekening] = useState("max_weegt_iets_meer") // standaard 
    const [aspect_type, setAspect_type] = useState("welzijn") // standaard 
    const [opmerking, setOpmerking] = useState("");
  
    const [dag_Aspect_data, setDag_Aspect_data] = useState([])

   

    const icons = {
      welzijn: {
        0: <span className="fg_color_0">X</span>,
        1: <FaSmile className="fg_color_1" />,
        2: <FaMeh className="fg_color_2" />,
        3: <FaFrown className="fg_color_3" />,
        4: <FaMeh className="fg_color_4" />,
        5: <FaAngry className="fg_color_5" />,
      },
      medicatie: {
        0: <span className="med_color_0">X</span>,
        1: <span className="med_color_1">--</span>,
        2: <FaMinus className="med_color_2" title="Slightly Less" />,
        3: <FaCheck className="med_color_3" title="Normal" />,
        4: <FaPlus className="med_color_4" title="More" />,
        5: <span className="med_color_5">++</span>,
      },
      gedaan: {
        0: <span className="fg_color_0">X</span>,
        1: <ImSleepy  className="gedaan_color_1" title="Resting" />,
        2: <FaBlind   className="gedaan_color_2" title="low effort" />,
        3: <FaWalking className="gedaan_color_3" title="medium Effort" />,
        4: <FaRunning className="gedaan_color_4" title="Moderate Effort" />,
        5: <FaBiking  className="gedaan_color_5" title="High Effort" />,

      },
      default: {
        0: <span className="fg_color_0">X</span>,
        1: <FaSmile className="fg_color_1" />,
        2: <FaMeh className="fg_color_2" />,
        3: <FaFrown className="fg_color_3" />,
        4: <FaMeh className="fg_color_4" />,
        5: <FaAngry className="fg_color_5" />,
      }
    };

    const getIcon1 = (aspect_type, waarde) => {
      if (icons[aspect_type] && icons[aspect_type][waarde]) {
        return icons[aspect_type][waarde];
      } else {
        console.log('193: geen icon gevonden voor ' + aspect_type + ' met waarde ' + JSON.stringify(waarde))
        return  <span className="fg_color_0">X</span>
      }
    };

    
    
   /*  updateDagdelen(nieuweWWaardes) {
      nieuweWaardes ziet er zo uit [0,2,3,1,2] altijd 5 waardes. 
      1) start met de huidige dagdelen,   
        const [dagDelen, setDagDelen] = useState([
          { dagdeel: 'nacht', waarde: 0 },
          { dagdeel: 'opstaan', waarde: 0 },
          { dagdeel: 'morgen', waarde: 0 },
          { dagdeel: 'middag', waarde: 0 },
          { dagdeel: 'avond', waarde: 0 }
        ]);
      2) pas de waardes aan in dagdelen, op basis van de array nieuweWaardes 
      3) gebruik setDagdelen om dagdelen bij te werken, zodat deze opnieuw gerendered RiFileWordLine.
    } */

    
    function updateDagdelen(nieuweWaardes) {
       // Controleer of nieuweWaardes precies 5 elementen bevat
      if (nieuweWaardes.length == 5) {
    
        // Maak een nieuwe array gebaseerd op dagDelen, met bijgewerkte waardes
        const bijgewerkteDagdelen = dagdelen.map((dagdeel, index) => ({
          ...dagdeel,
          waarde: nieuweWaardes[index] // Vervang de huidige waarde door de nieuwe
        }));
        // Werk de state bij
        console.log('100: ')
        console.log(bijgewerkteDagdelen)
        setDagdelen(bijgewerkteDagdelen);
      }
    }

    async function update_or_create_hgh_waarneming_via_API(waardeDagdelenArray, opmerking1) { // dit zijn de aspect buttons, met een waarde
      
      // waardeDagdelenArray is een array [1,4,5,3,2]
      console.log('140: ')
      console.log(waardeDagdelenArray)
      const waardeDagdelenString = waardeDagdelenArray.map(digit => digit || 0).join('').padEnd(5, '0');
      
      const postData = new FormData();

            //console.log('100 myUsers useffect 1 .. ')   
      postData.append('username'            , props.username);
      postData.append('apikey'              , props.apikey);
      postData.append('datum'               , props.datum);
      postData.append('aspect'              , props.aspect);
      postData.append('dagwaardeBerekening' , dagwaardeBerekening); 
      postData.append('waardeDagdelen'      , waardeDagdelenString);
      postData.append('opmerking'           , opmerking1);

      postData.append('action',  'update_or_create_hgh_waarneming_dagdelen');
  
      let requestOptions = {
        method: 'POST',
        body: postData,
      };
      const res = await fetch(fetchURL, requestOptions);   
      if (!res.ok) { throw res;}
      return res.json();
    } 

    const slaop = () => { 
      update_or_create_hgh_waarneming_via_API(waardeDagdelenArray, opmerking)
      
    }

    async function get_dag_Aspect_data_from_api() {
      const postData = new FormData();
      
      //console.log('100 myUsers useffect 1 .. ')   
      console.log('181 get_dag_Aspect_data aangeroepen ')   
      postData.append('username' , props.username);
      postData.append('apikey'   , props.apikey);
      postData.append('date'     , props.datum);
      postData.append('aspect'   , props.aspect);
      postData.append('action',  'getData_oneAspect_oneDay');
  
      let requestOptions = {
        method: 'POST',
        body: postData,
      };
      const res = await fetch(fetchURL, requestOptions);   
      if (!res.ok) { throw res;}
      return res.json();
    } 

    useEffect(() => {
      if (show) {
        get_dag_Aspect_data_from_api()
          .then((res) => {
            console.log('195')
            console.log(res.data)
            setWaardeDagdelenArray (res.data.waardeDagdelen.split('').map(Number)) 
            setWaarde(res.data.waarde)
            setAspect_type(res.data.aspect_type)
            console.log('198:')
            // console.log(waardeDagdelenArray)
            console.log(res.data.waardeDagdelen.split('').map(Number))
            console.log(waarde)
             
              // setWaardeDagdelenString (res.data.waardeDagdelen)
          })
          .catch((error) => {
            console.error('Error fetching data:', error);
          });
      } 
        
    }, [show]);

    const options = useMemo(() => {
      const aspectIcons = icons[aspect_type] || icons.default;
      return Object.keys(aspectIcons).map(key => ({
        value: key,
        label: aspectIcons[key], // Directly reference the icon
      }));
    }, [icons, aspect_type]);


  

    const handleClose = () => { 
      slaop()
      props.callBack_set_hgh_details() 
      setShow(false)
    }
    
    const handleAnnuleer = () => { 
      props.callBack_set_hgh_details()
      // console.log('66: waarde voor..: ' + waarde)
      // setWaarde(oldWaarde)
      // setOpmerking(oldOpmerking)

      // console.log('67: oldWaarde: ' + oldWaarde + " waarde na..: " + waarde)
      // update_or_create_hgh_waarneming_via_API(oldWaarde, oldOpmerking); 
      setShow(false); 
    }

    const callBack_handleShow = useCallback(() => { 
      setShow(true)
    },[])

    // Handle change in a select option
    const handleSelectChange = (selected, waardeIndex) => {
   
    };

    const callBack_handleChangeWaarde = useCallback((nieuweWaarde) => {
      
    },[])

    function getValueDagdeel(options1, dagdeel) {//value={options.find(option => option.value === dagdeel.waarde)} // Vind het juiste object
      let value =  options1.find(option => String(option.value) === String(dagdeel.waarde)) || { value: '', label: 'Geen keuze' }
      console.log('228')
      console.log(options1)
      console.log(dagdeel)

      return value
    }
    
    

    useEffect(() => {
      const defaultValue = options[3]; // 4e optie (index is 3)
    }, []);

    useEffect(() => { 
      // 
    }, [show, waarde]) 

    return (
      <>        
        <GetSliderButton 
          icon              = {getIcon1(aspect_type, waarde)} // Dynamically passing the icon
          waarde            = {waarde} 
          size              = {'basic'} 
          callBack          = {callBack_handleShow}
        />
        {opmerking
        ? <div className = "xx-small" >
            {opmerking.substr(0,5)}
          </div>
        : ""
        }
        <Modal contentClassName='modalBody' show={show} onHide={handleClose} active="true" centered backdrop={false}>
          <Modal.Header>
            <Modal.Title>
              {getIcon1(aspect_type, waarde)}
              {'teller'} {teller}

              {props.aspect} {props.datum}  {'-'}  {aspect_type} {'-'} {waarde}  
              <span className='space'></span> <span className='space'></span> 
              <GetSliderButton  
                icon             = {getIcon1(aspect_type, waarde)} // Dynamically passing the icon
                waarde           = {waarde} 
                size             = {'large'} 
                callBack         = {callBack_handleChangeWaarde}
              />
            </Modal.Title>  
          </Modal.Header>
          <Modal.Body> 
         {dagdelenInvullen=='ja'?
          <>

            <p> 
              Waarde per dagdeel:   
              <span className='space'></span>  
              {waardeDagdelenArray.map(digit => digit || 0).join('').padEnd(5, '0') // de dagwaardes in getallen 
              }
            </p> 
          
            <p> 
              Dagwaarde berekend: -+
            </p>
          
            <table size="sm" >
              <thead>
                <tr key={'waardeDagdeel_edit_row_header'}>
                {dagdelen.map(dagdeel  => 
                  <th className = "edit_waardeDagDeel_header"> {dagdeel.naam}</th>
                )}
                </tr>
              </thead>

              <tbody>
                <tr key={'waardeDagdeel_edit_row'}>
                  {dagdelen.map((dagdeel, dagdeelIndex) => (
                    <td key={`wdd_td_${dagdeel.naam}`} className={`color_${dagdeel.waarde}`}>                    
                    {/* {console.log("301:",  dagdeel) } */}
                
                      <Select
                        key={"wdd_" + dagdeelIndex}
                        isSearchable={false}      
                        options={options}
                        //value={options.find(option => option.value === dagdeel.waarde)} // Vind het juiste object
                        // value={options.find(option => String(option.value) === String(dagdeel.waarde)) || { value: '', label: 'Geen keuze' }}
                        value = {getValueDagdeel(options, dagdeel)}
                        placeholder="Select an option"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <br></br>
          </>
          : ""
          }
          <br/>
          <div> 
            Dagdelen Invullen: {dagdelenInvullen}
          </div>
          <br/>
          
          <div style={{'fontSize': 'large', 'fontWeight': '500','paddingBottom': '0.3rem'} }>
          {dagdelenInvullen=='ja'? ' Of wijzig hier alle dagdelen naar' : 'Geef de waarde voor de hele dag op'}
          </div>
          <Table striped bordered hover variant="light" size="sm" >
            <tr key={uuidv4()}>  
              {/* {console.log('135: ' + aspect_type + '  ' + icon)}          */}
              {dagdelen.map((waarde, index) => 
                  <td className='perc12' key={index}>         
                      <GetSliderButton 
                        icon             ={getIcon1(aspect_type, waarde)}  // Dynamically get the icon based on aspect_type and waarde
                        waarde          = {waarde} 
                        size            = {'x-large'} 
                        callBack        = {callBack_handleChangeWaarde}
                      />
                  </td>
              )}
              <td className='perc12' key={uuidv4()}>
                <GetSliderButton 
                  icon             = {"X"} 
                  waarde           = {0} 
                  size             = {'x_large'} 
                  callBack         = {callBack_handleChangeWaarde}
                />
              </td>
            </tr>
          </Table>     
          <div style={{'fontSize': 'large', 'fontWeight': '500','paddingBottom': '0.3rem'} }> Opmerking: </div>
          <input type="text" 
            value    = {opmerking} 
            size     = '42'
            onChange = {((event) => {setOpmerking(event.target.value)})}>         
          </input>    
                  
            {/* <UploadFile callback_uploadModal_fileChanged ={callback_uploadModal_fileChanged}/> */}
        </Modal.Body>
        <Modal.Footer>     

          <Button variant="primary" onClick={handleAnnuleer}>
            annuleer
          </Button>
    
          <Button variant="primary" onClick={handleClose}>
            opslaan en sluiten
          </Button>
          </Modal.Footer>
        </Modal>
      </>
    )
  }

  EditWaardeDagdelenModal.propTypes = {
    //callBackWaarde: propTypes.number.isRequired
    callBack_set_hgh_details: propTypes.func,    
    username              : propTypes.string, 
    apikey 	              : propTypes.string, 
    aspect                : propTypes.string, 
    datum                 : propTypes.string, 
  }
  
  export default EditWaardeDagdelenModal; 