/* eslint-disable no-unused-vars */
import {useState, useEffect, useCallback} from 'react';
import React          from 'react';
import {useSwipeable} from 'react-swipeable';
import Table          from 'react-bootstrap/Table';
import Button         from 'react-bootstrap/Button';
import propTypes      from 'prop-types'; // ES6
import {dateToTxt, get_changedDate_asTxt} from './utils.js'
//import {maandNamenKort} from './utils.js'
import {maandNamenKort}        from './global_const.js'
import {basic_API_url}         from './global_const.js'
import EditWaardeDagdelenModal from './EditWaardeDagdelenModal.jsx'
import EditOpmerkingModal      from './EditOpmerkingModal.jsx'
import NewAspectModal          from './NewAspectModal.jsx'
import SliderMonthsColored     from './SliderMonthsColored.jsx'
import ChangeSliderVisibility  from './ChangeSliderVisibility.jsx'
import {getLastDateOfDutchWeek} from './utils.js'

import {v4 as uuidv4}  from 'uuid';
import {FaRegEyeSlash} from "react-icons/fa";
import {AiOutlineEdit} from "react-icons/ai";
import {AiOutlineClose, AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";

const Slider = (props) => { // the component starts here

  const fetchURL =   basic_API_url() + "php/mebyme.php"

  const showDebugMessages = false;
  const [hghData, setHghData] = useState([]);  //checken ... lijkt niet goed

  const [message, setMessage] = useState("");  
  const [myMessages, setMyMessages] = useState(["geen melding"]); // voor testen API

  const [username, setUsername] = useState(() => {
    let username = props.username
    return username ? username : 'guest' // standaard 
  })

  const [sliderEndDate_asTxt, setSliderEndDate_asTxt] = useState(() => {
      let newDate = window.localStorage.getItem('lastDateInSlider')
      if (newDate === null) { 
        newDate = dateToTxt(new Date())
        window.localStorage.setItem('lastDateInSlider', newDate)
      }
      return newDate
      //return "2025-06-26" 
  })
  
  const getPeriod = (width) => {
    if (width < 700) return 7;
    if (width < 850) return 11;
    if (width < 1100) return 14;
    if (width < 1400) return 18;
    if (width < 1600) return 21;
    return 28;
  };
  
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const [period, setPeriod] = useState(() => getPeriod(window.innerWidth));

  const [repeatDatesRow, setRepeatDatesRow] = useState(() => {
    const screenHeight = window.innerHeight;
    return screenHeight > 950;  
  });

  const [monthRow, setMonthRow] = useState([])

  const [sliderData1, setSliderData1]                 = useState([])
  const [metaWeek, setMetaWeek]	                      = useState([])
  const [hghAspecten, setHghAspecten]                 = useState([])
  const [aspect_meta_bron, setAspect_meta_bron]       = useState("") // for moths weeks color 
  const [aspect_meta_symbool, setAspect_meta_symbool] = useState("") // for moths weeks letter or symbol 
  const [opmerkingen, setOpmerkingen]                 = useState([])
  const [hghOverigeAspecten, setHghOverigeAspecten]   = useState([])
  const [aspectTypes, setAspectTypes]                 = useState([])
  const [available_images, setAvailable_images]       = useState([])
  const [berekenmethodes, setBerekenmethodes]         = useState([])
  const [apikey, setApikey] = useState(() => {
    // let apikey = window.localStorage.getItem('apikey')
    let apikey = props.apikey
    return apikey ? apikey :'guestapikey2' // standaard 
  })

  const [hasToReloadData, setHasToReloadData ]= useState(false)

  var selectOptions = [];
  for (let i = 0; i < 6; i++) {
      selectOptions[i] = i;
  }

  const addNewMessage = (newMessage) => {
    const updatedMessages = [...myMessages, newMessage];
    setMyMessages(updatedMessages);
  };

  function txtDateFormat (date_asTxt, vorm) // zeer specifieke weergave, dus geen gebruik gemaakt van dateformat etc..
    // aanleveren geldige datum in text bijv 6-03 of 06-3 --> MOET NOG Met jaar ervoor 
  { 
    // uit elkaar halen:
    const eindDatum = new Date(sliderEndDate_asTxt)  // de laatste datum
    const startDatum = new Date (get_changedDate_asTxt(sliderEndDate_asTxt, ((period*-1)+1)));
    const startDag = startDatum.getDate()
    // console.log (' 91: startDatum: '  + sliderEndDate_asTxt + " dag: " + startDag)
    
    const datum   = new Date(date_asTxt) 
    const jaar    = datum.getFullYear()
    const maand   = datum.getMonth()
    const dag     = datum.getDate()
    const formatter = new Intl.DateTimeFormat('nl-NL',{ weekday: 'short' });
    const weekdag = formatter.format(datum);

    if (vorm == 'dagNr') { return dag} 
    else 
      if (vorm == 'dagNr_maandNamenKortSoms') {
        if (dag<4 || (dag % 7) == 0) return dag  + " " + maandNamenKort[maand]
        else return dag
      } else 
        if (vorm == 'maandNamenKortStart') {
          if (dag === startDag || dag == 2) {
            return maandNamenKort[maand] 
          } else 
            return dag
      } else 
        if (vorm == 'weekDag') {
          return weekdag
        } 
      else return dag  + " " + maandNamenKort[maand]
  }

  const numDays = (y, m) => new Date(y, m, 0).getDate();

  function create_slider_monthROW (datesRow) // de namen van de maanden boven de datums
  
  // deze versie gaat uit van maximaal 2 maanden in beeld in de slider. ij meer zal de middelste maand ontbreken
    { 
    let monthRow = []
    datesRow.forEach(() => monthRow.push("") )
    // console.log('229:  datesRow')
    // console.log(monthRow)
    
    const eindDatum   = new Date(sliderEndDate_asTxt)  // de laatste datum
    const startDatum  = new Date (get_changedDate_asTxt(sliderEndDate_asTxt, ((period*-1)+1)))
    const startDag    = startDatum.getDate()
    const eindDag     = eindDatum.getDate()
    const aantalDagen_eersteMaand = numDays(startDatum.getFullYear(), startDatum.getMonth())
    const aantalDagen = 1 +  (eindDatum.getTime() - startDatum.getTime())/(1000 * 60 * 60 * 24)
    
    // console.log('240: startDag: ' + startDag + ' aantalDagen_eersteMaand: ' + aantalDagen_eersteMaand)
    // console.log(monthRow)
    if (startDag == aantalDagen_eersteMaand-1 ) {
      monthRow[0]               = maandNamenKort[startDatum.getMonth() ]
      monthRow[ aantalDagen-3]  = maandNamenKort[eindDatum.getMonth() ]
    } else if (startDag >= aantalDagen_eersteMaand - 2) {
      monthRow[1]               = maandNamenKort[startDatum.getMonth() ]
      monthRow[ aantalDagen-3]  = maandNamenKort[eindDatum.getMonth() ]
    } else if (eindDag >= 2 && startDatum.getMonth() < eindDatum.getMonth()) {
      monthRow[1]               = maandNamenKort[startDatum.getMonth() ]
      monthRow[ aantalDagen-2]  = maandNamenKort[eindDatum.getMonth() ]
    } else {
      monthRow[ Math.floor((aantalDagen-2)/2)] = maandNamenKort[startDatum.getMonth() ]
    }
    
    // console.log('137: startDag: ' + startDag + ' eindDag: ' + eindDag )
    // console.log('1e maand: ' + startDatum.getMonth() +  ' aantalDagen_eersteMaand: ' + aantalDagen_eersteMaand + ' aantalDagen: ' + aantalDagen) 

    // console.log('140: monthRow:')
    // console.log(monthRow)

    // create een array 

    setMonthRow(monthRow)
  }

  async function update_bijInvoerTonen_naar_kan_via_API(aspect) { // action == koppel aspect of update 
    const postData = new FormData();
          //console.log('100 myUsers useffect 1 .. ')   
    postData.append('username', props.username);
    postData.append('apikey',   props.apikey);
    postData.append('aspect',   aspect);
    postData.append('bijInvoerTonen', 'kan');
    postData.append('action',  'update_aspect_bijInvoerTonen_1User');

    let requestOptions = {
      method: 'POST',
      body: postData,
    };

    const res = await fetch(fetchURL, requestOptions);   
    if (!res.ok) { throw res;}
    
    return res.json();
  } 

  async function deleteOpmerkingViaApi (opm_id)  { // action == koppel aspect of update 
    const postData = new FormData();
          //console.log('100 myUsers useffect 1 .. ')   
    postData.append('username', props.username);
    postData.append('apikey',   props.apikey);
    postData.append('opm_id',   opm_id);
    postData.append('action',  'delete_opmerking');

    let requestOptions = {
      method: 'POST',
      body: postData,
    };

    const res = await fetch(fetchURL, requestOptions);   
    if (!res.ok) { throw res;}
    
    return res.json();
  } 

  const handleClick_aspect_eye_out = (aspect) => {
    let result = update_bijInvoerTonen_naar_kan_via_API(aspect) 
    //console.log('206: eye uit geklikt van aspect: ' + aspect)
    
    setHasToReloadData(true);
  }

  const handleClickDeleteOpmerkingViaApi = (opm_id) => {
    let result = deleteOpmerkingViaApi(opm_id) 
    // console.log('187: delete opmerking met id: ' + opm_id)
    
    setHasToReloadData(true);
  }

  function createSliderWeek(hghData, teTonenAspecten) {
    // in: HghData per aspect     
 
    // console.log('184: hghData in createsliderWeek' )
    // console.log(hghData)
    if (hghData) {
    
      // *********************************************************
      // creeer een array met alle datums uit period--> datesRow
      // *********************************************************
      
      let datesRow = []
      let loopDatum = get_changedDate_asTxt(sliderEndDate_asTxt, ((period * -1) + 1));
      // console.log('119: loopDatum: ' + loopDatum + ' sliderEndDate_asTxt: ' + sliderEndDate_asTxt)
      datesRow.push(loopDatum)
      while (loopDatum<sliderEndDate_asTxt) {
        loopDatum = get_changedDate_asTxt(loopDatum, 1)
        datesRow.push(loopDatum)
      }

        create_slider_monthROW(datesRow);
      //  console.log('124: (datesRow):' + datesRow )

      // **********************************************************************************
      // Maak een nieuwe array hghData_alleDagen_alleAspecten,  

      //        De lijsten datesRow hghData zijn beide gesorteerd op datum, 
      //        Je loopt per aspect beide lijsten tegelijk door.
      //        ontbreekt er een datum dan wordt die in de nieuw array toegevoegd met waarde 0 
      
      // ***********************************************************************************

      let hghData_alleDagen_alleAspecten = []
      // doorloop alle aspecten uit de hghData:

      hghData.forEach( hghRow => {
        // console.log('184:')
        // console.log(hghData)
        let loopRowIndex = 0  
        
        let hghData_alleDagen = [] // lege dataRow
        datesRow.forEach(date => {
          if (date == hghRow.data[loopRowIndex].datum) {
            let dataObject = {
              'datum'                : date, 
              'aspect'               : hghRow.data[0].aspect,
              'waarde'               : hghRow.data[loopRowIndex].waarde,
              'waardeDagdelenString' : hghRow.data[loopRowIndex].waardeDagdelen,
              'dagdelenInvullen'     : hghRow.data[loopRowIndex].dagdelenInvullen,
              'dagwaardeBerekening'  : hghRow.data[loopRowIndex].dagwaardeBerekening,
              'opmerking'            : hghRow.data[loopRowIndex].opmerking
            }
            hghData_alleDagen.push( dataObject )

            let len = Object.keys(hghRow.data).length
            if (loopRowIndex <  len-1) loopRowIndex +=1
          
          } else {
            let dataObject = {
              'datum'                 : date, 
              'aspect'                : hghRow.data[0].aspect,
              'waarde'                : 0,
              'waardeDagdelenString'  : "00000",
              'dagdelenInvullen'      : hghRow.data[0].dagdelenInvullen,
              'dagwaardeBerekening'   : hghRow.data[0].dagwaardeBerekening,
              'opmerking'             : null
            }
            hghData_alleDagen.push( dataObject )
          }
        })

        // console.log('294: a hghData_alleDagen: ')
        // console.log(hghData_alleDagen)
        // console.log('294: b')

        hghData_alleDagen_alleAspecten.push({
          'aspect'      : hghRow.data[0].aspect , 
          'aspect_type' : 'unknown',
          'icon'        : hghRow.icon,
          'data'        : hghData_alleDagen 
        })
      })

      // **********************************************************************************
      //    check of alle aspecten uit de array teTonenAspecten voorkomen 
      //    in hghData_alleDagen_alleAspecten, zo niet voeg lege array toe va dat aspect
      // **********************************************************************************

      // console.log('182: hghData_alleDagen_alleAspecten')
      // console.log(hghData_alleDagen_alleAspecten)

      teTonenAspecten.forEach((teTonenAspect, teTonenAspectIndex) => {
        // is dit aspect al opegnomen??
        let hghData_alleDagen=[];
        if (teTonenAspect.bijInvoerTonen==='ja') {    //  Moet je dit aspect tonen? 
          // console.log("303: " + teTonenAspect.aspect + " === ja")               
          if (!hghData_alleDagen_alleAspecten.find((zoekAspect) => zoekAspect.aspect === teTonenAspect.aspect)) {
            //  Is dit aspect NOG NIET opgenomen in hghData_alleDagen_alleAspecten, de huisige slider
            // console.log(teTonenAspect.aspect + " nog opnemen") 

            // breid de slider uit met een nieuwe regel met dit aspect
            datesRow.forEach(date => {
              let dataObject = {
                'datum'               : date, 
                'aspect'              : teTonenAspect.aspect,
                'waarde'              : 0,
                'dagdelenInvullen'    : teTonenAspect.dagdelenInvullen, 
                'dagwaardeBerekening' : teTonenAspect.dagwaardeBerekening,
                'opmerking'           : null
              }
              hghData_alleDagen.push( dataObject )
            });
          
            hghData_alleDagen_alleAspecten.push({
              'aspect'      : teTonenAspect.aspect , 
              'aspect_type' : 'unknown',
              'icon'        : 'empty',
              'data'        : hghData_alleDagen 
            })
          } 
        } else {
          // console.log("303: " + teTonenAspect.aspect + " =X= niet Ja")  
        }
      });

      //  ******************************** 
      //      Voeg aspect_type toe
      //  ********************************
      // console.log("337:zoek de aspecten in: aspect teTonenAspecten" ) 
      // console.log(JSON.stringify(teTonenAspecten))

      hghData_alleDagen_alleAspecten.forEach((aspectData) => {
        // zoek aspect_type op in de array en wijzig deze. 
        // console.log("340: hghData_alleDagen_alleAspecten:" ) 
        // hghData_alleDagen_alleAspecten.forEach(dat => {
        //   //console.log(dat.aspect_type)
        //   dat.data.forEach(datRow => console.log(JSON.stringify(datRow)))
        // })
        let teZoekenAspect = aspectData.aspect
        let orgTeZoekenAspect = aspectData.aspect
        
        // console.log("345: zoek naar " + teZoekenAspect)
        if (aspectData.aspect.includes("max_")) {
          teZoekenAspect = teZoekenAspect.substring(4)
          // console.log("345max yes: "+ aspectData.aspect + " contains max_ wordt nu: " +  teZoekenAspect)        
          // aspectData.aspect_type = teTonenAspecten.find((zoekAspect) => zoekAspect.aspect === aspectData.aspect).aspect_type
        } else {
          //console.log("345max no: "+ aspectData.aspect + " ( "  + teZoekenAspect + " ) XX contains NO max_") 
         }
        // console.log("355: -" + teZoekenAspect + "- " + teZoekenAspect.length)
         
         let tmp = teTonenAspecten.find((zoekAspect) => zoekAspect.aspect === teZoekenAspect)
        
        if (tmp === undefined) { // aspect niet gevonden 
          // console.log ("362: tmp = undefined, hier is de lijst:") 
          teTonenAspecten.forEach( teTonenAspect=> {
            // console.log(teTonenAspect)
          })
          aspectData.aspect_type = teZoekenAspect 
          
        } else { 
          // console.log ("366: max gevonden: " + tmp.aspect_type) 
          // console.log(JSON.stringify(tmp))
          aspectData.aspect_type = tmp.aspect_type
        }
       
          // console.log("371: gezocht: " + orgTeZoekenAspect +  " gebruikt: " + teZoekenAspect + " gevonden aspect_type: " + aspectData.aspect_type)
      
      })
      setSliderData1 (hghData_alleDagen_alleAspecten)  
      // console.log("376: hghData_alleDagen_alleAspecten:" ) 
      // hghData_alleDagen_alleAspecten.forEach(dat => {
      //   // console.log(dat.aspect_type)
      //   //dat.data.forEach(datRow => console.log(JSON.stringify(datRow)))
      // })
    } 
  }   

  const changeSliderDate = (deltaDays) => {
    // console.log('391: sliderEndDate_asTxt: ' + sliderEndDate_asTxt +  ' deltaDays: '+ deltaDays)
    // console.log(get_changedDate_asTxt(sliderEndDate_asTxt, deltaDays))
    let newDate = get_changedDate_asTxt(sliderEndDate_asTxt, (deltaDays*1))
    setSliderEndDate_asTxt(newDate)
    window.localStorage.setItem('lastDateInSlider', newDate)
  }
  
  const maakIndividueleDagWaardes = (waardesAsString) => {
    // console.log("401: "+ waardesAsString)
    if (waardesAsString === undefined)  return Array(5).fill('0')

    const arr = waardesAsString.split(''); // Split the string into an array of characters
    while (arr.length < 5) {
      arr.push('0'); // Fill with empty strings until the length is 5
    }
    return arr;
  }

  const setSliderDateToNow = () => {  

    setSliderEndDate_asTxt(dateToTxt (new Date()))

  }
  
  const metaWekenTerug = () => {  
    if (width < 550) return 13;
    if (width < 850) return 26;
    if (width < 1050) return 39;
    else return 52
  }

  async function getData() {
    const postData = new FormData();
    setMyMessages([...myMessages, '221 getData aangeroepen']);
    //console.log('100 myUsers useffect 1 .. ')   
    postData.append ('username', username);
    postData.append('apikey', apikey);
    postData.append('startDate', get_changedDate_asTxt(sliderEndDate_asTxt, ((period*-1)+1)));
    postData.append('endDate', sliderEndDate_asTxt);
    postData.append('wekenTerug', metaWekenTerug());
    
    postData.append('action', 'get_hgh_period');

    let requestOptions = {
      method: 'POST',
      body: postData,
    };
    const res = await fetch(fetchURL, requestOptions);   
    if (!res.ok) { throw res;}
    return res.json();
  } 

  useEffect (() => {
    // console.log('225: Slider useEffect aangeroepen, sliderEndDate_asTxt:' + sliderEndDate_asTxt + " period: " + period)
    getData()
    .then ((res) => {
      setMessage(res['hghPeriod']['messages'][0])
      createSliderWeek(res['hghPeriod']['dataPerAspect'], res['hghPeriod']['teTonenAspecten']) // with hghData
      setHghData(res['hghPeriod']['dataPerAspect'])
      setMetaWeek(res['hghPeriod']['metaWeek']['data_alleWeken_inPeriode'])

      setHghAspecten(res['hghPeriod']['teTonenAspecten'])
      setHghOverigeAspecten(res['hghPeriod']['overigeAspecten'])
      setAspectTypes(res['hghPeriod']['teTonenAspectTypes'])
      setAspect_meta_bron(res['hghPeriod']['aspect_meta_bron'])    
      setAspect_meta_symbool(res['hghPeriod']['aspect_meta_symbool'])    
      setOpmerkingen(res['hghPeriod']['opmerkingen'])
      setBerekenmethodes(res['hghPeriod']['berekenmethodes'])
      // console.log('350: opmerkingen from API:')
      // console.log(res['hghPeriod']['opmerkingen'])
      setAvailable_images(res['hghPeriod']['iconsData']['imageNamesList'])
      setHasToReloadData(false)
    })
  }, [sliderEndDate_asTxt, period, hasToReloadData] ) 

  useEffect(() => {
    const handleOrientationChange = () => {
      const orientation = screen.orientation || screen.mozOrientation || screen.msOrientation;
  
      if (orientation.type.includes("portrait")) {
        // Portretmodus
        console.log("Portrait mode detected");
      } else if (orientation.type.includes("landscape")) {
        // Landschapsmodus
        console.log("Landscape mode detected")
      }
  
      const newWidth = window.innerWidth; setWidth(newWidth)
      setHeight(window.innerHeight)
      setPeriod(getPeriod(newWidth));
    };
  
    // Attach the event listeners on mount
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
  
    handleOrientationChange();

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  const callBack_set_hgh_details  = useCallback(() => {
      setHasToReloadData(true) 
  },[])

  const callBack_changePeriod  = useCallback((year_week) => {
    setSliderEndDate_asTxt(getLastDateOfDutchWeek(year_week))
    setHasToReloadData(true) 
  },[])

  const callBackSetWaardeEnOpmerking = useCallback((aspect, datum, oudeWaarde, nieuweWaarde, oudeOpmerking, nieuweOpmerking) => {
    if (oudeWaarde===nieuweWaarde) {
       // console.log ('callBackSetOpmerking: Opmerking NIET veranderd' + oudeOpmerking + ' --> ' + nieuweOpmerking)
    } else {
      setHasToReloadData(true) 
      //console.log ('callBackSetOpmerkingOpmerking aangeroepen: opmerking WEL veranderd veranderd' + oudeOpmerking + ' --> ' + nieuweOpmerking)
    }
  },[])

  const callBack_changeSliderVisibility = useCallback((visibilityChanged) => {
    //console.log ('307: callBack_changeSliderVisibility aangeroepen met visibilityChanged = ' + visibilityChanged)
    if (visibilityChanged) {
      setHasToReloadData(true) 
    }
  },[])

  const handleSwipe = (eventData, direction) => {
    const screenWidth = window.innerWidth;
    const startX = eventData.initial[0]; // X-coordinate of where the swipe started
    const deltaY = eventData.deltaY // Y-distance of the swipe
  
    // Example: Only trigger if the swipe starts on the left part of the screen
    if (startX < screenWidth / 1.5) {
      // console.log(`504: Swipe detected in the left part of the screen, direction: ${direction}`);
  
      // Different logic based on direction
      if (direction === 'right') {
        changeSliderDate(period * -1); // Logic for swiping right
      } else if (direction === 'left') {
        changeSliderDate(period * 1); // Logic for swiping left
      }
    }
  
  };	  
  

  // Wrapper functions to call handleSwipe with the correct direction
  const handleSwipedRight = (eventData) => handleSwipe(eventData, 'right');
  const handleSwipedLeft = (eventData) => handleSwipe(eventData, 'left');
  
  // Swipeable handlers
  const handlers = useSwipeable({
    onSwipedRight: handleSwipedRight,
    onSwipedLeft: handleSwipedLeft,

    preventDefaultTouchmoveEvent: true, // Prevent scrolling when swiping
    trackMouse: true, // Enable mouse swiping for desktop
    delta: 10, // Swipe sensitivity
  });

  return (
    props.logged_in?
 
    <div className=" w3-center w3-animate-zoom fitIn " style={{ width: "400px" }}
    >

      <div> width: {width} height: {height} period: {period} </div>
       {metaWeek.length>0 &&  (
          <SliderMonthsColored 
            username                 = { username }
            apikey                   = { apikey }           
            metaWeek                 = { metaWeek } 
            aspect                   = { 'benauwd' }          // het aspect waarop de kleuren zijn gebaseerd in de eerste rij
            hghAspecten              = { hghAspecten }
            aspect_meta_bron         = { aspect_meta_bron?aspect_meta_bron:''} // het aspect waarop de letter in 2e rij is gebaseerd
            aspect_meta_symbool      = { aspect_meta_symbool?aspect_meta_symbool:''} // het aspect waarop de letter in 2e rij is gebaseerd
            callBack_changePeriod    = { callBack_changePeriod }
            callBack_set_hgh_details = { callBack_set_hgh_details }
            fetchURL                 = { fetchURL }
          />
        )}
 
      <Table key="slidermenu" striped bordered hover size="sm" style={{ width: "inherit" }}> 
        <thead>
        </thead>
        <tbody>
          {/* ********** NAVIGATIE boven de slider  *********** */}          
          <tr>
            <td key="slider_dateMenuRow_back"> 
                <Button className = "buttonBasis x-smallButton" onClick={ () => changeSliderDate( period * -1 )}> <AiOutlineArrowLeft/> </Button>
            </td> 
            <td key="slider_period_select"  >
              <select 
                style     = {{ fontSize: 'small', marginTop: '0.2rem'  }} 
                onChange  = { (e) => { setPeriod(e.target.value) }} 
                className = "form-select"
                value={period} // Set the default value dynamically
              >
                <option defaultValue disabled>
                  periode
                </option>
                <option value="7" > 1 week</option>
                <option value="14"> 2 week</option>
                <option value="21"> 3 week</option>
                <option value="28"> 4 week</option>
                <option value="31"> 31 dagen</option>
              </select>
            </td>
   
            <td key="slider_dateMenuRow_date" style={{ paddingTop: '0.8rem'  }}>{sliderEndDate_asTxt}</td> 
            
            <td key="slider_dateMenuRow_now">
              <Button onClick={ () => setSliderDateToNow()}> nu </Button>
            </td>
          
            <td key="slider_dateMenuRow_forward">
              <Button className = "buttonBasis x-smallButton" onClick={ () => changeSliderDate( period )}> <AiOutlineArrowRight/> </Button>
            </td>
            
          </tr>  
        </tbody>
      </Table>
      
      {/* {console.log("496: :")}
      {console.log(JSON.stringify(sliderData1))} */}
    
      { sliderData1[0] ?
        <div  {...handlers} >
          <Table key={uuidv4()} striped bordered hover size="sm"> 
            {/*     **************************************  
                      1: schrijf de KOP regels met datums    
                    **************************************       */ }
            <thead>
            </thead>
            <tbody>

          {/* EERST de  opmerkingen */}

          <tr> 
            <td className='opmerkingen_header l' key={uuidv4()} colSpan={period + 2}>
              <div className='linksRechtContent'>
                <div>
                  Opmerkingen 
                  <span className="x-small leftSpace">van - tot</span>
                </div>
                <div>
                  <EditOpmerkingModal 
                    username                 = { username }
                    apikey                   = { apikey }                      
                    datum_start              = { get_changedDate_asTxt(sliderEndDate_asTxt, ((period*-1)+1)) } 
                    datum_einde              = { sliderEndDate_asTxt}  
                    aspect                   = { "opmerking" }
                    opmerking                = { "" } 
                    fetchURL                 = { fetchURL }
                    callBack_set_hgh_details = { callBack_set_hgh_details}
                  />
                </div>               
              </div>

            </td>
          </tr>
          <tr>
            <td className='opmerkingen' key={uuidv4()} colSpan={period + 2}>
              {opmerkingen.map((opm, index) => 
                <div key={"opm_" + opm.id} className='opmerking_row'>
                  {/* <Button  size="sm" > <AiOutlineEdit /> </Button> */}
                  <Button variant="warning" className="xx-smallButton opacity_50perc" onClick={ () => handleClickDeleteOpmerkingViaApi(opm.id)}>
                    <AiOutlineClose /> 
                  </Button>
                  <span className='x-small leftSpace' >
                    {new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short' }).format(new Date(opm.datum_start))}
                    {opm.datum_einde? 
                      <> 
                        - {new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short' }).format(new Date(opm.datum_einde))}
                     
                      </>
                    : ""
                    }
                  </span>
                  <span className='space'></span>
                  {opm.opmerking} 
                </div>
              )}
            </td>
          </tr>
         

          {/* **** 1a: deafkorting van de maand boven de rij met dagen van de week **** */}
          <tr key={uuidv4()}>  
            <td className='striped small' key={uuidv4()}>
              maand:
            </td>
            { monthRow.map((item, itemIndex) => 
                <th className='striped small' key={uuidv4()}>    
                  {item}
                </th>
              )
            }
          </tr>
              
          {/* **** 1a: de namen van de dag **** */}

          <tr key={"sliderWeekDagRow"}>
            <td className='striped small' key={uuidv4()}>
          
            </td>
            { sliderData1[0].data.map((item, itemIndex) => 
                  <td className='striped small' key={uuidv4()}>    
                    <span className="x-small" >
                      {txtDateFormat(item.datum,'weekDag')}
                    </span>
                  </td>
              )
            }
          </tr>

          {/* **** 1b: de datums (getallen) met in eerste kolom een checkbox **** */}
          
          <tr key={"sliderDatumRow"}>
            <td className='striped small' key={uuidv4()}>
              <input 
                key='repeateDatesRow' 
                type='checkbox' 
                checked={repeatDatesRow} 
                onChange={ (e) => { setRepeatDatesRow(e.target.checked) }} 
              /> 
              <span className='space'></span>
              datum: 
            </td>
            { sliderData1[0].data.map((item, itemIndex) => 
                  <td className='striped small' key={uuidv4()}>    
                    {txtDateFormat(item.datum,'dagNr')}
                  </td>
              )
            }
          </tr>
                        

          {/*     **************************************  
                  2: zet de rijen met aspecten op het scherm   
                  **************************************
          */}

      
          {/* Dan per aspect de regels */}

          {aspectTypes.map((teTonenAspectType, teTonenAspectIndex) => (
              <React.Fragment key={teTonenAspectIndex}>
                <tr key={uuidv4()}>
                  <td colSpan={1} key="slider_period_visibility"></td>
                  <td colSpan={period-1} >
                    {teTonenAspectType}
                    <span className='space'></span>
                    <ChangeSliderVisibility 
                      username          = { username }
                      apikey            = { apikey }     
                      teTonenAspectType = { teTonenAspectType} 
                      berekenmethodes   = { berekenmethodes }                
                      aspectLijst       = { hghAspecten }
                      overigeAspecten   = { hghOverigeAspecten }
                      fetchURL          = { fetchURL }
                      callBack_changeSliderVisibility = { callBack_changeSliderVisibility }
                    />
                  </td>
                  <td >
                    <NewAspectModal
                      username          = { username }
                      apikey            = { apikey }  
                      aspectType        = { teTonenAspectType }
                      berekenmethodes   = { berekenmethodes }                  
                      fetchURL          = { fetchURL }
                      callBack_changeSliderVisibility = { callBack_changeSliderVisibility }
                    />
                  </td>
                </tr>

                {(repeatDatesRow && teTonenAspectIndex>0)?
                  <tr key={uuidv4()}>
                    <th className='striped small' key={uuidv4()}>
                      datum: 
                    </th>
                    { sliderData1[0].data.map((item, itemIndex) => 
                          <th className='striped x-small' key={uuidv4()}>    
                            {txtDateFormat(item.datum,'dagNr')}
                          </th>
                    )}
                  </tr>
                  : ""
                }
                { sliderData1.filter(aspect => aspect.aspect_type === teTonenAspectType).map(
                  (dataRow, dataRowIndex) => 
                    <tr key={uuidv4()}>
                      <td key={uuidv4()} className='striped small'> {/* eerste kolom  */} 
                        {dataRow.aspect.length<10 
                        ? <div className ="small" >{dataRow.aspect.substring(0,9)} </div>
                          : <div className = "long-word-break x-small" >
                          {dataRow.aspect}
                        </div>

                        }
                        <FaRegEyeSlash
                          size  = "1rem"
                          color = "grey"
                          onClick= {() => handleClick_aspect_eye_out(dataRow.aspect)}
                        />
                      </td>                      

                      {dataRow.data.map( (dagData, dagDataIndex) => // per button van links naar rechts ..
                          <td key = {uuidv4()}>                          
                            {/* { console.log(dagData.dagwaardeBerekening + '  ' + dagData.aspect + '  ' + dagData.waarde +  ' waardeDagdelenString: ' + dagData.waardeDagdelenString)} */}
                            {dagData.waarde>=0 
                             // {dagData.waarde>=0 && dagData.waarde // nog maken wel of geen 0 waardes tonn
                             ? <> 
                                <EditWaardeDagdelenModal 
                                  username                  = { username }
                                  apikey                    = { apikey }                      
                                  datum                     = { dagData.datum  } 
                                  aspect                    = { dagData.aspect }
                                  waarde                    = { dagData.waarde }
                                  opmerking                 = { dagData.opmerking }
                                  callBack_set_hgh_details  = { callBack_set_hgh_details }
                                />
                                </>                              
                              : 
                                ""
                            }
                          </td>
                      )}
                    </tr>
                )}
            </React.Fragment>
          ))}
            </tbody>
          </Table>
        </div>
        : "Geen data"
      }   

      <br></br>

      {showDebugMessages?
      <div>
        <ul>
          {
            myMessages.map((message) => 
            <> <li >{message}</li> </>
          )}
        
        </ul>
      </div>
      : ""
      }  
      {/* {JSON.stringify(sliderData1)} */}
    </div>
    : "geen data"
  )
}

Slider.propTypes = {
  apikey:   propTypes.string.isRequired,
  username: propTypes.string.isRequired,
  logged_in: propTypes.bool.isRequired
  // callBack_myUsers_from_editRole: propTypes.func.isRequired
  }

export default Slider;