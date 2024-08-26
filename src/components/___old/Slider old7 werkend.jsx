import {useState, useEffect, useCallback  } from 'react'
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

import EditWaardeModal from './EditWaardeModal.jsx'

// import DeleteUser from './deleteUser.jsx';
// import EditUser from './editUser.jsx';
// import EditRole from './editRole.jsx';


const Slider = (props) => { 

  const fetchURL = "http://localhost/mebyme/php/mebyme.php"
  const showDebugMessages = false;
  const [hghData, setHghData] = useState([]);           //checken ... lijkt niet goed
  const [hghData_old, setHghData_old] = useState([]);   //checken ... lijkt niet goed

  const [counter, setCounter] = useState(0);

  const [message, setMessage] = useState("");
  const [myMessages, setMyMessages] = useState(["geen melding"]);

  const [username, setUsername] = useState(() => {
    let username = props.username
    return username ? username : 'guest' // standaard 
  })
  

  const [sliderEndDate_asTxt, setSliderEndDate_asTxt] = useState("2024-06-24")
  const [period, setPeriod] = useState(7) // standaard een week

  const [sliderData1, setSliderData1] = useState([])
  const [hghAspecten, setHghAspecten] = useState([])

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
    
  function get_changedDate_asTxt(dateNow_txt, deltaDays) {
       
    const newDate = new Date (dateNow_txt)

    if (deltaDays>7) { 
      console.log('74:')
      console.log('74a1 newDate: '+ newDate)
      console.log('74a2 newDate: '+ newDate.getDate())
    }

    newDate.setDate(newDate.getDate() + deltaDays)
    
    
    if (deltaDays>7) { 
      
      console.log('74a3 newDate: '+ newDate)

      console.log('74b deltadays: ' +  deltaDays )
      console.log('74c newDate.getDate(): '+ newDate.getDate())
      console.log('74d newDate.getDate() + deltaDays: ' + newDate.getDate() + deltaDays)
    }

    let jaar =  newDate.getFullYear()
    let maand = newDate.getMonth() + 1
    let dag =   newDate.getDate() 
    if (maand<10) maand = "0" + maand
    if (dag<10) dag  = "0" + dag
    // console.log('82: deltaDays: ' + deltaDays + ' changedData: ' + (jaar + '-' + maand + '-' + dag))

    return (jaar + '-' + maand + '-' + dag) 
  }

  function txtDateFormat (date_asTxt, vorm) // zeer specifieke weergave, dus geen gebrui gemaakt van datformat etc..
    // aanleveren geldige datum in text bijv 6-03 of 06-3 --> MOET NOG Met jaar ervoor 
  { const mnd = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
  
    // uit elkaar halen:
    const datum = new Date(date_asTxt) 
    const jaar  = datum.getFullYear()
    const maand = datum.getMonth()
    const dag =   datum.getDate()

    if (vorm == 'dagNr_maandNaamKort') {
      const dateNewVorm = dag + " " + mnd[maand]
      // const minusposition = date_asTxt.indexOf('-')
      // const dateNewVorm =  date_asTxt.substr(minusposition+1, (date_asTxt.length-(minusposition+1))) 
      //                   + " "
      //                   + mnd[date_asTxt.substr(0,minusposition)-1]
      return dateNewVorm
    } else 
      return date_asTxt
  }

  function createSliderWeek (hghData, teTonenAspecten) {
    // in: HghData per aspect     
 
    console.log('107: ' )
    console.log(teTonenAspecten)
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

        console.log('140:')
        console.log(hghData)
        let loopRowIndex = 0  
        
        let hghData_alleDagen = [] // lege dataRow
        datesRow.forEach(date => {
          if (date == hghRow.data[loopRowIndex].datum) {
              
            let dataObject = {
              'datum'  : date, 
              'aspect' : hghRow.data[0].aspect,
              'waarde' : hghRow.data[loopRowIndex].waarde
            }
            hghData_alleDagen.push( dataObject )

            let len = Object.keys(hghRow.data).length
            if (loopRowIndex <  len-1) loopRowIndex +=1
          
          } else {
            let dataObject = {
              'datum'       : date, 
              'aspect'      : hghRow.data[0].aspect,
              'waarde'      : 0
            }
            hghData_alleDagen.push( dataObject )
          }
        })

        hghData_alleDagen_alleAspecten.push({
          'aspect': hghRow.data[0].aspect , 
          'aspect_type' : 'unknown',
          'data' : hghData_alleDagen 
        }

        )
      })
      //console.log('172: hghData_alleDagen_alleAspecten')
      // console.log(hghData_alleDagen_alleAspecten)

      // **********************************************************************************
      //    check of alle aspecten uit de array teTonenAspecten voorkomen 
      //    in hghData_alleDagen_alleAspecten, zo niet voeg lege array toe va dat aspect
      // **********************************************************************************

      console.log('182: hghData_alleDagen_alleAspecten')
      console.log(hghData_alleDagen_alleAspecten)

      teTonenAspecten.forEach((teTonenAspect, teTonenAspectIndex) => {
        // is dit aspect al opgnomen??
        let hghData_alleDagen=[];
        if (teTonenAspect.bijInvoerTonen==='ja') {    //  Moet je dit aspect tonen?        
          if (!hghData_alleDagen_alleAspecten.find((zoekAspect) => zoekAspect.aspect === teTonenAspect.aspect)) {
            //  Is dit aspect NOG NIET opgenomen in hghData_alleDagen_alleAspecten, de huisige slider
            console.log(teTonenAspect.aspect + " nog opnemen") 

            // breid de slider uit met een nieuwe regel met dit aspect
            console.log(' 193: datesRow' )
            datesRow.forEach(date => {
              let dataObject = {
                'datum'       : date, 
                'aspect'      : teTonenAspect.aspect,
                'waarde'      : 0
              }
              hghData_alleDagen.push( dataObject )
            });
          
            hghData_alleDagen_alleAspecten.push({
              'aspect': teTonenAspect.aspect , 
              'aspect_type' : 'unknown',
              'data' : hghData_alleDagen })
            
          } 

        }
      });

      //  ******************************** 
      //      Voeg aspect_type toe
      //  ********************************
      hghData_alleDagen_alleAspecten.forEach((aspectData) => {
        // zoek type_aspect op in de array en wijzig deze. 
        aspectData.aspect_type = teTonenAspecten.find((zoekAspect) => zoekAspect.aspect === aspectData.aspect).type_aspect
      })
      console.log('230: ')
      console.log(hghData_alleDagen_alleAspecten)
      setSliderData1 (hghData_alleDagen_alleAspecten)  

    } 
  }   

  const changeSliderDate = (deltaDays) => {
    console.log('215: sliderEndDate_asTxt: ' + sliderEndDate_asTxt +  ' deltaDays: '+ deltaDays)
    console.log(get_changedDate_asTxt(sliderEndDate_asTxt, deltaDays))

    setSliderEndDate_asTxt(get_changedDate_asTxt(sliderEndDate_asTxt, (deltaDays*1)))
 }

  async function getData() {
    const postData = new FormData();
    setMyMessages([...myMessages, '221 getData aangeroepen']);
    //console.log('100 myUsers useffect 1 .. ')   
    postData.append ('username', username);
    postData.append('apikey', apikey);
    postData.append('startDate', get_changedDate_asTxt(sliderEndDate_asTxt, ((period*-1)+1)));
    postData.append('endDate', sliderEndDate_asTxt);
    postData.append('action', 'get_HGH_period');

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
      setHghData_old(res['hghPeriod']['data'])
     
      createSliderWeek(res['hghPeriod']['dataPerAspect'], res['hghPeriod']['teTonenAspecten']) // with hghData

      setHghData(res['hghPeriod']['dataPerAspect'])    
      setHghAspecten(res['hghPeriod']['teTonenAspecten'])
      setHasToReloadData(false)
    })
  }, [sliderEndDate_asTxt, period, hasToReloadData] ) 

  const callBackSetWaarde = useCallback((aspect, datum, oudeWaarde, nieuweWaarde) => {
    // alert(aspect + '  op ' + datum + ' aangepast van: ' + oudeWaarde + ' --> ' + nieuweWaarde) 
    console.log ('265type: ' + typeof(sliderData1))
    console.log (JSON.stringify(sliderData1))
    if (oudeWaarde===nieuweWaarde) {
    
      console.log ('callBackSetWaarde: waarde NIET veranderd' + oudeWaarde + ' --> ' + nieuweWaarde)
    } else {
      setHasToReloadData(true) 
      console.log ('callBackSetWaarde aangeroepen: waarde WEL veranderd veranderd' + oudeWaarde + ' --> ' + nieuweWaarde)
    }
    },[])



  return (
    <>
      <Table key="slidermenu" striped bordered hover variant="light" size="sm"> 
          <tr>
            <td key="slider_period_select">
              <select onChange={ (e) => { setPeriod(e.target.value) }} className="form-select">
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
            <td key="slider_dateMenuRow_back"> 
              <Button onClick={ () => changeSliderDate( period *-1 )}> 🡸 </Button>
            </td> 
                   
            <td key="slider_dateMenuRow_date">{sliderEndDate_asTxt}</td> 
          
            <td key="slider_dateMenuRow_forward">
              <Button onClick={ () => changeSliderDate( period )}> 🡺 </Button>
            </td>
           
          </tr>  
      </Table>

      { sliderData1[0] ?
        <Table key="data" striped bordered hover variant="light" size="sm"> 
          {/*     **************************************  
                    1: schrijf de KOP regels met datums    
                  **************************************
          */}
            <tr>
              <th className='striped small' key='sliderDatumKol1'>datum</th>
              { sliderData1[0].data.map((item, itemIndex) => 
                    <th className='striped x-small' key={itemIndex}>    
                      {txtDateFormat(item.datum,'dagNr_maandNaamKort')}
                    </th>
                )
              }
            </tr>

          {/*     **************************************  
                  2 :Schrijf de data regels  
                  **************************************
          */}

          {console.log('340: ')}

          {console.log(sliderData1[0].aspect_type)}
          { sliderData1.map((dataRow, dataRowIndex) => 
            <>
              <tr>
                <td key={dataRowIndex} className='striped small'> {/* eerste kolom  */} 
                  {dataRow.aspect}
                </td>
                
                {dataRow.data.map( (dagData, dagDataIndex) => 
                  <>
                    <td key = {dagDataIndex} > 
                      {dagData.waarde>=0?<>
                       
                        <EditWaardeModal 
                          username  = { username }
                          apikey    = { apikey }                      
                          datum     = { dagData.datum  } 
                          aspect    = { dagData.aspect }  
                          waarde    = { dagData.waarde } 
                          fetchURL  = { fetchURL }
                          callBackSetWaarde={callBackSetWaarde}
                        />
                        </>
                      : "--"
                      }
                    </td>

                  </>
                )}
                
              </tr>
            </>
          )}
     
        </Table>
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
         
    </>
  );  

}

Slider.propTypes = {

  // value: propTypes.string.isRequired,
  // callBack_myUsers_from_editRole: propTypes.func.isRequired
  }

  

export default Slider;