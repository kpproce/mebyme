import { useState, useEffect,  useCallback} from 'react';
import { Modal, Table, Button} from "react-bootstrap";
import propTypes from 'prop-types'; // ES6
import { v4 as uuidv4 } from 'uuid';
import { IoIosAdd } from "react-icons/io";

const  newAspectModal = (props) => {

    // --------------------------------------
    // een 
    const [show, setShow] = useState(false);
    const [newAspect, setNewAspect] = useState("");
    const [dagwaardeBerekening, setDagwaardeBerekening] = useState(props.berekenmethodes[0].id);
    const [dagdelenInvullen, setDagdelenInvullen] = useState("ja");
    const [mainMessage, setMainMessage] = useState("");
    const [error, setError] = useState('');
    console.log ("16")

    // de datums worden aangeleverd, die zijn ingevuld als beginen ne einddatum op je scherm
   
   
    const handleClose = () => { 
      // props.callBack();
      setShow(false); 
      //props.callBackOpmerking(2); // de naam van de geuploade file
    }

  /*   const handleSaveAndClose = () => { 
      handleSave();
      handleClose(); 
    }; */

    async function create_newAspect_via_API() {
      const postData = new FormData();
            //console.log('100 myUsers useffect 1 .. ')   
      postData.append('username',  props.username);
      postData.append('apikey',    props.apikey);
      postData.append('newAspect', newAspect); 
      postData.append('aspect_type', props.aspectType); 
      postData.append('dagdelenInvullen',    dagdelenInvullen); 
      postData.append('dagwaardeBerekening', dagwaardeBerekening); 
      
      postData.append('action', 'insert_aspect');
  
      let requestOptions = {
        method: 'POST',
        body: postData,
      };

      const res = await fetch(props.fetchURL, requestOptions);   
      if (!res.ok) { throw res;}
      console.log('52')

      const jsonData = await res.json();
      if (!jsonData.toegevoegd) alert(jsonData.mainMessage)

      return jsonData;
    } 
  
    const handleShow = () => setShow(true)

    const callBack_handleShow = useCallback(() => { 
      setShow(true)
    },[])

    const handleSaveAndClose = () => { setShow(true)
      if (newAspect.length<3) alert('aspect te kort, niet toegevoegd!') 
      else {
        create_newAspect_via_API()
        props.callBack_changeSliderVisibility(true)
      }
      setShow(false); 
    }

    const onAspectInputChange = (value) => { // validation en onthouden newApect
      if (value.length > 24) {setError('maximum 23 karakters lang'); return}
      if (/^[0-9]/.test(value)) {setError('Geen cijfer als eerste letter'); return}
      if (!/^[a-z0-9_]*$/.test(value)) { setError('Gebruik alleen kleine letters of cijfer'); return}
      // If all validations pass, update input and clear error
      setNewAspect(value);
      setError('');
      return
    }

    return (
      <>
      {/* {console.log('79: editOpmerkingModal: '+  props.opmerking) }  */}
  
        <span className = "x-small"  onClick={handleShow}>
          <span className='space'></span>
          <Button className = "plusButton smallPaddingHeight " > < IoIosAdd /> </Button>
        </span>
      
        <Modal contentClassName='modalBody' show={show} onHide={handleClose} active="true" centered backdrop={false}>
          <Modal.Header>
            <Modal.Title>
              <span className='small'>Maak nieuw aspect voor </span> {props.aspectType}
            </Modal.Title>  
          </Modal.Header>
          <Modal.Body className='modalBody'> 
 
          aspect: <span className='space'/>
            <input type="text" 
              className   = 'invoerBC'
              value       = {newAspect} 
              placeholder = "nieuw aspect (vul in)"
              size        ='25'
              onChange    = {(event) => {onAspectInputChange (event.target.value)}}
            >
            </input> 

     
            <br/><br/>Bij invoer tonen? <span className='x-small'>nog niet gebouwd</span>
            <span className='space'/>
            ja (default), nee, alsData
            
            <div className='x-small'>
              Toon dit aspect bij invoeren, altijd, niet of als er data is in de periode
              Dit is nuttig om de juiste aspecen te tonen bij invoeren van je metingen.
            </div>

          <br/>dagdelen invullen?
            <span className='space'/>
            <label>
              <input 
                type="checkbox" 
                checked={dagdelenInvullen === "ja"} // checkbox standaard aangevinkt als "ja"
                onChange={(e) => setDagdelenInvullen(e.target.checked ? "ja" : "nee")} 
                style={{ width: '1.2rem', height: '1.2rem' }} //
              />    
               <span className='space'/>
              {dagdelenInvullen}
            </label>
            <div className='x-small'>
              Moet bij dit aspect de 5 dagdelen ingevuld worden (vinkje)? of 1 waarde voor de hele dag invullen (geen vinkje)
            </div>
        
            <br/><br/>Kies dagwaardeBerekening:
            <select 
              className = "form-control invoerBC" 
              id        = {"newAspectSelectDagwaardeBerekening"}
              value     = {dagwaardeBerekening}
              onChange  = {
                //() => handleClick_visibilityChange_button(aspectDetails.aspect, aspectDetails.bijInvoerTonen, 'update') 
                (event) => { 
                    console.log('160')
                    {setDagwaardeBerekening(event.target.value)}
                  }
              }
              
            >
            {props.berekenmethodes.map((item, index) => (
              <option key={index} 
              value={item.id}>
                {item.id}
              </option>
            ))}
            </select>
            <div className='x-small'>
              Selecteer een methode om vanuit 5 dagdelen de waarde voor de gehele dag te berekenen
            </div>
            dagwaardeBerekening: 
            {dagwaardeBerekening}
          
            {error && <p style={{ color: 'red' }}>{error}</p>}          

          </Modal.Body>
          <Modal.Footer>     
            <Button variant="primary" onClick={handleSaveAndClose}>
              sla op en sluit
            </Button>
            <Button variant="primary" onClick={handleClose}>
              annuleer
            </Button>
            </Modal.Footer>
        </Modal>
      </>
    )
  }

  newAspectModal.propTypes = {
    //callBackOpmerking: propTypes.number.isRequired
    callBack_changeSliderVisibility: propTypes.func,    
    username          : propTypes.string, 
    apikey 	          : propTypes.string, 
    berekenMethodes   : propTypes.array,
    aspectType        : propTypes.string,
    fetchURL          : propTypes.string 
  }
  
  export default newAspectModal; 