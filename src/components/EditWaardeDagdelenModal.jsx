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
    const [selectedValue, setSelectedValue] = useState(3)
    const [dagdelenInvullen, setDagdelenInvullen] = useState("ja")
    const [dagwaardeBerekening, setDagwaardeBerekening] = useState("max_weegt_iets_meer") // kan weg --> naar php 
    const [aspect_type, setAspect_type] = useState("welzijn") // standaard 
    const [opmerking, setOpmerking] = useState(props.opmerking);
  
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
    
    function createWaardeDagdelenString() { // dagdelen => string, bijv: "34561" 
      // Join the array into a string and ensure it's exactly 5 characters long with `padEnd`
      return dagdelen
        .map((dagdeel) => dagdeel.waarde || 0)
        .join('')
        .padEnd(5, '0'); // Ensure the string is at least 5 characters
    }

    function createUpdatedDagdelen(newWaardeAsString) { // in: string bijv: ('34125') => actie, update dagdelen
      if (!newWaardeAsString || newWaardeAsString.length !== 5 || !/^\d{5}$/.test(newWaardeAsString)) {
       console.log(newWaardeAsString)
        console.error('Invalid newWaardeAsString: it must be a string with exactly 5 digits.');
        
        return dagdelen; // Return the existing state if invalid
      }
      return dagdelen.map((dagdeel, index) => ({
        ...dagdeel,
        waarde: parseInt(newWaardeAsString[index], 10)
      }));
    }
        
    // function updateDagdelen(nieuweWaardes) {
    //    // Controleer of nieuweWaardes precies 5 elementen bevat
    //   if (nieuweWaardes.length == 5) {
    
    //     // Maak een nieuwe array gebaseerd op dagDelen, met bijgewerkte waardes
    //     const bijgewerkteDagdelen = dagdelen.map((dagdeel, index) => ({
    //       ...dagdeel,
    //       waarde: nieuweWaardes[index] // Vervang de huidige waarde door de nieuwe
    //     }));
    //     // Werk de state bij
    //     console.log('100: bijgewerkteDagdelen')
    //     setDagdelen(bijgewerkteDagdelen);
    //   }
    // }

    async function update_or_create_hgh_waarneming_via_API() { // dit zijn de aspect buttons, met een waarde
        
      const postData = new FormData();

      console.log('139  ', createWaardeDagdelenString())   
      postData.append('username'            , props.username);
      postData.append('apikey'              , props.apikey);
      postData.append('datum'               , props.datum);
      postData.append('aspect'              , props.aspect);
     
      postData.append('waardeDagdelen', createWaardeDagdelenString()); // like "23234"
      postData.append('opmerking'           , opmerking);

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
      update_or_create_hgh_waarneming_via_API()
      
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
            setWaarde(res.data.waarde)
            setOpmerking(res.data.opmerking)
            console.log('168: opmerking', res.data.opmerking)
            setAspect_type(res.data.aspect_type)
            setDagdelen(createUpdatedDagdelen(res.data.waardeDagdelen))
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


    const getIcon1 = (aspect_type, waarde, id) => {
      if (icons[aspect_type] && icons[aspect_type][waarde]) {
        return icons[aspect_type][waarde];
      } else {
        return  <span className="fg_color_0">X</span>
      }
    };

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
    const handleSelectChange = (selectedDagdeelIndex, newValue) => {
      // pas dagWaarde aan

      console.log('215 handleSelectChange selected: ', selectedDagdeelIndex , 'newValue: ', newValue) 
      setDagdelen(prevDagdelen => 
        prevDagdelen.map((dagdeel, i) => i === selectedDagdeelIndex ? { ...dagdeel, waarde: newValue } : dagdeel)
      );


    };

    const callBack_handleChangeWaarde = useCallback((nieuweWaarde) => {
      setDagdelen(createUpdatedDagdelen(String(nieuweWaarde).repeat(5)))
      console.log('220: wijzig alle dagdeelwaardes naar ' +  nieuweWaarde + ' -> ' + (String(nieuweWaarde).repeat(5))) 
    },[])

    function getValueDagdeel(dagdeel) {//value={options.find(option => option.value === dagdeel.waarde)} // Vind het juiste object
      let value =  options.find(option => String(option.value) === String(dagdeel.waarde)) || { value: '', label: 'Geen keuze' }
      //console.log('228')

      //console.log(dagdeel)

      return value
    }
    
    useEffect(() => { 
   
    }, []) 

    return (
      <>        
        <GetSliderButton 
          icon              = {getIcon1(aspect_type, waarde, 1 )} // Dynamically passing the icon
          waarde            = {waarde} 
          size              = {'x-large'} 
          callBack          = {callBack_handleShow}
        />
        {opmerking
        ? <div className = "xx-small" >
            {opmerking.substring(0,7)}
          </div>
        : ""
        }
        <Modal contentClassName='modalBody' show={show} onHide={handleClose} active="true" centered backdrop={false}>
          <Modal.Header>
            <Modal.Title>
              {getIcon1(aspect_type, waarde, 2)}
              <span className='space'/>
              <span className='small'>
                {props.aspect} {props.datum}  {'-'}  {aspect_type} {'-'} {waarde}  
              </span>
            </Modal.Title>  
          </Modal.Header>
          <Modal.Body> 
         {dagdelenInvullen=='ja'?
          <>

            {/* het bovenste deel met een select voor alle 5 de dagdelen. */}

            <p> 
              Waarde per dagdeel:   
              <span className='space'></span>  
              {createWaardeDagdelenString(dagdelen) }
            </p> 
          
          
            <table size="sm" className='full-width-table'>
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
                     <td key={`wdd_td_${dagdeel.naam}`} className={`bk_color_${dagdeel.waarde} `}>
                        <Select
                          key={`wdd_${dagdeelIndex}`}
                          isSearchable={false}
                          options={options}
                          value={options[dagdeel.waarde] || null}
                          placeholder="kies"
                          onChange={(selectedOption) => handleSelectChange(dagdeelIndex, selectedOption.value)}
                          classNamePrefix="bk_select"
                          className={`bk_color_${dagdeel.waarde}`}
                          styles={{
                            dropdownIndicator: (base) => ({
                              ...base,
                              display: "none", // Verwijder de dropdown-indicator volledig
                            }),
                            indicatorsContainer: (base) => ({
                              ...base,
                              display: "none", // Verwijder ook de container van de indicatoren
                            }),
                            control: (base) => ({
                              ...base,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              backgroundColor: "yourColorHere", // Voeg hier de gewenste achtergrondkleur toe
                            }),
                          }}
                        />
                   </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </>
          : ""
          }

            {/* het onderste deel met 1 klik alle 5 de dagwaardes vullen. */}

          <div className="x-small"> 
            Dagdelen Invullen: {dagdelenInvullen}
          </div>
          <br/>
          
          <div style={{'fontSize': 'large', 'fontWeight': '500','paddingBottom': '0.3rem'} }>
          {dagdelenInvullen=='ja'? ' Of wijzig hier alle dagdelen naar' : 'Geef de waarde voor de hele dag op'}
          </div>
          <Table striped bordered hover variant="light" size="sm" >
            <tbody className='noStyle'>
            <tr key={uuidv4()}>  
              {[1,2,3,4,5,0].map((dagdeelIndex, index) => 
                  <td key={index} >         
                      <GetSliderButton 
                        icon             ={getIcon1(aspect_type, dagdeelIndex, 4)}  // Dynamically get the icon based on aspect_type and waarde
                        waarde          = {dagdeelIndex} 
                        size            = {'x-large'} 
                        callBack        = {callBack_handleChangeWaarde}
                      />
                  </td>
              )}
            </tr>
            </tbody>
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