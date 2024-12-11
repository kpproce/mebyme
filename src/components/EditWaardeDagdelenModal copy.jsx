// Disclaimer (manly about customStyles)
// this code is written with a lot of suggestions from chatGPT. They where not allways consistent
// Some best practice like using classes were not applyable, becouse the Bootstrap classes could not be altered
// on the other hand, some techniques like customStyles are interesting

import { useState, useEffect,  useCallback} from 'react';
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
    const [aantalKnoppen]        = useState([1,2,3,4,5])

    const [waarde, setWaarde] = useState(props.waarde);
    const [waardeDagdelenArray, setWaardeDagdelenArray] = useState(['0','0','0','0','0']) // standaard 
    const [dagdelenInvullen, setDagdelenInvullen] = useState("ja")
    const [dagwaardeBerekening, setDagwaardeBerekening] = useState("max_weegt_iets_meer") // standaard 
    const [aspect_type, setAspect_type] = useState("welzijn") // standaard 
    const [opmerking, setOpmerking] = useState("");
  
    const [dag_Aspect_data, setDag_Aspect_data] = useState([])

    const icons = {
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

    const [options] = useState(() => {
      const aspectIcons = icons[aspect_type] || icons.default;
      return Object.keys(aspectIcons).map(key => ({
        value: key,
        label: aspectIcons[key] // Directly reference the icon
      }));
    });


  
    
    const [selectedOption, setSelectedOption] = useState([]);

    const getIcon1 = (aspect_type, waarde) => {
      if (icons[aspect_type] && icons[aspect_type][waarde]) {
        return icons[aspect_type][waarde];
      }
      return icons.default[waarde] || null;
    };

    const getSelectClassName = (waarde) => {
      return `fg_color_${waarde}`;  // Use your existing class names
    };

    const customStyles = {
      control: (provided) => ({
        ...provided,
        backgroundColor: 'rgb(50,60,180)', // Background color
        display: 'flex',
        flexDirection: 'column', // Align items in a column
        alignItems: 'center', // Center items horizontally
        justifyContent: 'center', // Center items vertically
        padding: '0',
        minHeight: '60px', // Set a minimum height if needed
      }),
    
      dropdownIndicator: (provided) => ({
        ...provided,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0',
        margin: '0',
        width: '50px', // Adjust width if necessary
      }),
    
      indicatorSeparator: (provided) => ({
        ...provided,
        display: 'none',
      }),
    
      valueContainer: (provided) => ({
        ...provided,
        justifyContent: 'center', // Center the selected value text
        padding: '0',
      }),
    
      singleValue: (provided) => ({
        ...provided,
        textAlign: 'center', // Center the text horizontally
        padding: '0',
      }),
    
      option: (provided) => ({
        ...provided,
        // Option styling
      }),
    
      menu: (provided) => ({
        ...provided,
        backgroundColor: 'rgb(50,60,180)', // Ensure menu background is consistent
      })
    };
    
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
            
            const initialOptions = res.data.waardeDagdelen.split('').map(Number).map(waarde => {
              const option = options.find(opt => opt.value === waarde);
              return option || null;  
            });

            console.log('210:')
            console.log(initialOptions)

            setSelectedOption(initialOptions);

              // setWaardeDagdelenString (res.data.waardeDagdelen)
          })
          .catch((error) => {
            console.error('Error fetching data:', error);
          });
      } 
        
    }, [show]);

    const get_dag_Aspect_data = () => { 
      let data1 = get_dag_Aspect_data_from_api()
      setDag_Aspect_data ();
    }

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
      const updatedOptions = [...selectedOption];
      updatedOptions[waardeIndex] = selected; // Update selected option at specific index
      setSelectedOption(updatedOptions);
  
      // Update waardeDagdelen with the newly selected value
      const updatedWaardeDagdelen = [...waardeDagdelenArray];
      updatedWaardeDagdelen[waardeIndex] = selected.value; // Update the value of the corresponding index
      setWaardeDagdelenArray(updatedWaardeDagdelen);
    };

    const callBack_handleChangeWaarde = useCallback((nieuweWaarde) => {
      setWaarde (nieuweWaarde)
      setWaardeDagdelenArray (Array(5).fill(String(nieuweWaarde))) 
    },[])

    useEffect(() => {
      const initialOptions = waardeDagdelenArray.map(waarde => {
        const option = options.find(opt => opt.value === waarde);
        return option || null;  
      });
      setSelectedOption(initialOptions);
    }, [waardeDagdelenArray]);


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

              {props.aspect} {props.datum}   
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
                  <th className = "edit_waardeDagDeel_header"> nacht</th>
                  <th className = "edit_waardeDagDeel_header"> opstaan</th>
                  <th className = "edit_waardeDagDeel_header"> ochtend</th>
                  <th className = "edit_waardeDagDeel_header"> middag</th>
                  <th className = "edit_waardeDagDeel_header"> avond</th>
                </tr>
              </thead>

              <tbody>
                <tr key={'waardeDagdeel_edit_row'}>
                  {waardeDagdelenArray.map((waarde, waardeIndex) => (
                    <td key={`wdd_td_${waardeIndex}`} className={`color_${waarde} edit_waardeDagDeel_Select`}>
                     
                      <Select
                        key={"wdd_" + waardeIndex}
                        isSearchable={false} 
                        styles={customStyles}
                        classNamePrefix="custom-select"
                        className={`select-container ${getSelectClassName(waarde)}`}
                        value={selectedOption[waardeIndex]}
                        onChange={(selected) => handleSelectChange(selected, waardeIndex)}
                        options={options}
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
              {aantalKnoppen.map((waarde, index) => 
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
            value= {opmerking} 
            size='42'
            onChange= {((event) => {setOpmerking(event.target.value)})}>         
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