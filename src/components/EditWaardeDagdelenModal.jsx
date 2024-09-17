// Disclaimer (manly about customStyles)
// this code is written with a lot of suggestions from chatGPT. They where not allways consistent
// Some best practice like using classes were not applyable, becouse the Bootstrap classes could not be altered
// on the other hand, some techniques like customStyles are interesting

import { useState, useEffect,  useCallback} from 'react';
import { Modal, Table, Col, Row, Button} from "react-bootstrap";
import GetSliderButton from './GetSliderButton.jsx';
import GetIcon from './GetIcon.jsx';
import { FaSmile, FaFrown, FaMeh, FaAngry } from 'react-icons/fa';

import propTypes from 'prop-types'; // ES6
import { v4 as uuidv4 } from 'uuid';
import Select from 'react-select';

const  EditWaardeDagdelenModal = (props) => {
    // const [id, setId] =  useState(1);
    // const [title, setTitle] =  useState("this song");
    const [show, setShow] = useState(false);

    const [aantalKnoppen]                     = useState([1,2,3,4,5])
    const [waarde, setWaarde]                 = useState(props.waarde);

    const [waardeDagdelen, setWaardeDagdelen] = useState(() => { 
       return props.waardeDagdelen ? props.waardeDagdelen : '00000' // standaard 
    })

    const [opmerking, setOpmerking]       = useState(props.opmerking);

    const [options] = useState([
      { value: '0', label: <span className="fg_color_0"> X</span> },
      { value: '1', label: <FaSmile className="fg_color_1" /> },
      { value: '2', label: <FaMeh   className="fg_color_2" /> },
      { value: '3', label: <FaFrown className="fg_color_3" /> },
      { value: '4', label: <FaMeh   className="fg_color_4" /> },
      { value: '5', label: <FaAngry className="fg_color_5" /> }
    ]);

    const [selectedOption, setSelectedOption] = useState([]);


    // Dynamically assign a class based on waarde

    const getSelectClassName = (waarde) => {
      return `fg_color_${waarde}`;  // Use your existing class names
    };

    // const customStyles = {
    //   // No need to define backgroundColor here, as you'll use classes
    //   control: (provided, state) => ({
    //     ...provided,
    //     // Conditional class application based on the state
    //     // This approach assumes you will apply classes conditionally via className
    //   }),
    //   // Add any other style overrides you need
    // };
    
    const customStyles = {
      control: (provided) => ({
        ...provided,
        backgroundColor: 'rgb(50,60,180)', // Background color
        display: 'flex',
        flexDirection: 'column', // Align items in a column
        alignItems: 'center', // Center items horizontally
        justifyContent: 'center', // Center items vertically
        padding: '0',
        minHeight: '40px', // Set a minimum height if needed
      }),
    
      dropdownIndicator: (provided) => ({
        ...provided,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0',
        margin: '0',
        width: '30px', // Adjust width if necessary
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
      console.log('97: ')
      console.log(waardeDagdelenArray)
      const waardeDagdelenString = waardeDagdelenArray.map(digit => digit || 0).join('').padEnd(5, '0');
      
      const postData = new FormData();

            //console.log('100 myUsers useffect 1 .. ')   
      postData.append('username'       , props.username);
      postData.append('apikey'         , props.apikey);
      postData.append('datum'          , props.datum);
      postData.append('aspect'         , props.aspect);
      postData.append('waardeDagdelen' , waardeDagdelenString);
      postData.append('opmerking'      , opmerking1);

      postData.append('action',  'update_or_create_hgh_waarneming_dagdelen');
  
      let requestOptions = {
        method: 'POST',
        body: postData,
      };
      const res = await fetch(props.fetchURL, requestOptions);   
      if (!res.ok) { throw res;}
      return res.json();
    } 

    const slaop = () => { 
      // props.callBack();
      // if (!opmerking.localeCompare(props.opmerking)==0) {
      update_or_create_hgh_waarneming_via_API(waardeDagdelen, opmerking)
      
      //props.callBackWaarde(2); // de naam van de geuploade file
    }

    const handleClose = () => { 
      // props.callBack();
      // if (!opmerking.localeCompare(props.opmerking)==0) {
    
      slaop()
      props.callBack_set_hgh_details() 
      setShow(false);
       
      //props.callBackWaarde(2); // de naam van de geuploade file
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
      const updatedWaardeDagdelen = [...waardeDagdelen];
      updatedWaardeDagdelen[waardeIndex] = selected.value; // Update the value of the corresponding index
      setWaardeDagdelen(updatedWaardeDagdelen);
    };

    const callBack_handleChangeWaarde = useCallback((nieuweWaarde) => {
      console.log ('170: nieuwe Waarde: '+ nieuweWaarde)
      setWaarde (nieuweWaarde)

      setWaardeDagdelen (Array(5).fill(String(nieuweWaarde)))
      // let result = update_waarde_via_API(nieuweWaarde);
      // console.log ('104: '+ result)
      // console.log (result)
      // handleClose()
      // wijzig waarde in de database, daarvoor heb je de username en api key nodg. Die haal je uit local storage.
      // props.callBackSetWaarde(props.aspect, props.datum, waarde, nieuweWaarde)
      //console.log('110: API aangeroepen') 
      //console.log(update_waarde_via_API()) 
    },[])
  

    useEffect(() => {
      const initialOptions = waardeDagdelen.map(waarde => {
        const option = options.find(opt => opt.value === waarde);
        return option || null;  
      });
      setSelectedOption(initialOptions);
    }, [waardeDagdelen]);


    useEffect(() => { 
      // 
    }, [show, props.waarde]) 

    useEffect(() => { 
      // console.log('!!! childcomponent is triggered')
    },  []) 

    return (
      <>
        {/*  { console.log('102: props: ') }  
           { console.log(JSON.stringify(props))}  
        */} 
        <GetSliderButton 
          aspect_type       = {props.aspect_type}
          icon              = {props.icon} 
          available_icons   = {props.available_icons }
          waarde            = {waarde} 
          size              = {'basic'} 
          callBack          = {callBack_handleShow}
        />

        {props.opmerking
        ? <div className = "x-small" >
            {props.opmerking.substr(0,7)}
          </div>
        : ""
        }



        <Modal contentClassName='modalBody' show={show} onHide={handleClose} active="true" centered backdrop={false}>
          <Modal.Header>
            <Modal.Title>
              {props.aspect} {props.datum}       
  
              <span className='space'></span>       <span className='space'></span> 

              <GetSliderButton 
                aspect_type     = {props.aspect_type} 
                icon            = {props.icon} 
                available_icons = {props.available_icons}
                waarde          = {waarde} 
                size            = {'large'} 
                callBack        = {callBack_handleChangeWaarde}
              />
              
            </Modal.Title>  
          </Modal.Header>
          <Modal.Body> 
         
         {props.dagdelenInvullen=='ja'?
          <>
            <p> 
              Waarde per dagdeel:   
              <span className='space'></span>  
              {waardeDagdelen.map(digit => digit || 0).join('').padEnd(5, '0') // de dagwaardes in getallen 
              }
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
                  {waardeDagdelen.map((waarde, waardeIndex) => (
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
            Dagdelen Invullen: {props.dagdelenInvullen}
          </div>
          <br/>
          
          <div style={{'fontSize': 'large', 'fontWeight': '500','paddingBottom': '0.3rem'} }>
          {props.dagdelenInvullen=='ja'? ' Of wijzig hier alle dagdelen naar' : 'Geef de waarde voor de hele dag op'}
          </div>
          <Table striped bordered hover variant="light" size="sm" style={{'maxWidth': '15rem'}}>
            <tr key={uuidv4()}>  
              {/* {console.log('135: ' + props.aspect_type + '  ' + props.icon)}          */}
              {aantalKnoppen.map((waarde, index) => 
                  <td className='perc12' key={index}>         
                      <GetSliderButton 
                        aspect_type     = {props.aspect_type} 
                        icon            = {props.icon} 
                        available_icons = {props.available_icons}
                        waarde          = {waarde} 
                        size            = {'large'} 
                        callBack        = {callBack_handleChangeWaarde}
                      />
                  </td>
              )}
              <td className='perc12' key={uuidv4()}>
                <GetSliderButton 
                  key             = {'editwaarde0'}
                  aspect_type     = {props.aspect_type} 
                  available_icons = {props.available_icons}
                  icon            = {props.icon} 
                  waarde          = {0} 
                  size            = {'large'} 
                  callBack        = {callBack_handleChangeWaarde}
                />
              </td>
            </tr>
          </Table>     
          <div style={{'fontSize': 'large', 'fontWeight': '500','paddingBottom': '0.3rem'} }> Opmerking: </div>
          <input type="text" 
            value= {opmerking} 
            size='42'
            onChange= {((event) => {setOpmerking(event.target.value)
              console.log('176: ' + opmerking)
            })}>         
          </input>    
                  
            {/* <UploadFile callback_uploadModal_fileChanged ={callback_uploadModal_fileChanged}/> */}
        </Modal.Body>
        <Modal.Footer>     

          <Button variant="primary" onClick={handleAnnuleer}>
            annuleer
            {/* props.selectedStart bevat de huidige filenaam*/ }
          </Button>
    
          <Button variant="primary" onClick={handleClose}>
            opslaan en sluiten
            {/* props.selectedStart bevat de huidige filenaam*/ }
          </Button>
          </Modal.Footer>
        </Modal>
      </>
    )
  }

  EditWaardeDagdelenModal.propTypes = {
    //callBackWaarde: propTypes.number.isRequired
    callBack_set_hgh_details: propTypes.func,    
    username         : propTypes.string, 
    apikey 	         : propTypes.string, 
    aspect_type      : propTypes.string, 
    aspect           : propTypes.string, 
    icon             : propTypes.string, 
    available_icons  : propTypes.array, 
    datum            : propTypes.string, 
    waarde           : propTypes.number,
    waardeDagdelen   : propTypes.array,
    dagdelenInvullen : propTypes.string,
    opmerking        : propTypes.string,
    fetchURL         : propTypes.string 
  }
  
  export default EditWaardeDagdelenModal; 