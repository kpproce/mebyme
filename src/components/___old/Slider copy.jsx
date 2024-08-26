import {useState, useEffect, useCallback  } from 'react'
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import PrintSmiley from './PrintSmiley.jsx';
import EditWaardeModal from './EditWaardeModal.jsx'



// import DeleteUser from './deleteUser.jsx';
// import EditUser from './editUser.jsx';
// import EditRole from './editRole.jsx';


const Slider = (props) => { 

  const fetchURL = "http://localhost/mebyme/php/mebyme.php"

  const [hghData, setHghData] = useState([]);
  const [hghData_old, setHghData_old] = useState([]);

  const [message, setMessage] = useState("");

  const [username, setUsername] = useState(() => {
    let username = props.username
    return username ? username : 'guest' // standaard 
  })
  
  const [sliderAspect, setSliderAspect] = useState ("geen");

  
  const [sliderEndDate_asTxt, setSliderEndDate_asTxt] = useState("2024-06-24")
  const [periode, setPeriod] = useState(7)

  const [sliderData1, setSliderData1] = useState([])

  const [apikey, setApikey] = useState(() => {
    // let apikey = window.localStorage.getItem('apikey')
    let apikey = props.apikey
    return apikey ? apikey :'guestapikey2' // standaard 
  })

  const [inputValue, setInputValue] = useState('')

  var selectOptions = [];
  for (let i = 0; i < 6; i++) {
      selectOptions[i] = i;
  }

    
  function getIcon(waarde) {
    // console.log('34: ' + waarde + "  " + typeof(waarde)) 
    waarde= "" + waarde
    switch (waarde) {
      case "0": return '-';
      case "1": return '😁';
      case "2": return '😐';
      case "3": return '😦';
      case "4": return '😒';
      case "5": return '😡';
      default:
       return waarde;
    }
  }

  function get_changedDate_asTxt(dateNow_txt, deltaDays) {
    let tomorrow = new Date (dateNow_txt)
    tomorrow.setDate(tomorrow.getDate() + deltaDays)
    let jaar =  tomorrow.getFullYear()
    let maand = tomorrow.getMonth() + 1
    let dag =   tomorrow.getDate() 
    if (maand<10) maand = "0" + maand
    if (dag<10) dag  = "0" + dag
    
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

  function createSliderWeek (hghData) {
    // in: HghData per aspect     
 
    if (hghData) {
    
      // *********************************************************
      // creeer een array met alle datums uit periode--> datesRow
      // *********************************************************
      
      let datesRow = []
      let loopDatum = get_changedDate_asTxt(sliderEndDate_asTxt, periode * -1);
 
      datesRow.push(loopDatum)
      while (loopDatum<sliderEndDate_asTxt) {
        loopDatum = get_changedDate_asTxt(loopDatum, 1)
        datesRow.push(loopDatum)
      }
      
      // **********************************************************************************
      // Maak een nieuwe array hghData_alleDagen_alleAspecten,  

      //        De lijsten datesRow hghData zijn beide gesorteerd op datum, 
      //        Je loopt per aspect beide lijsten tegelijk door.
      //        ontbreekt er een datum dan wordt die in de nieuw array toegevoegd met waarde 0 
      
      // ***********************************************************************************

      let hghData_alleDagen_alleAspecten = []
      // doorloop alle aspecten uit de hghData:

      hghData.forEach( hghRow => {

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
              'datum'  : date, 
              'aspect' : hghRow.data[0].aspect,
              'waarde' : 0
            }
            hghData_alleDagen.push( dataObject )
          }
        })


        hghData_alleDagen_alleAspecten.push({'aspect': hghRow.data[0].aspect , 'data' : hghData_alleDagen }

        )
      })

      setSliderData1 (hghData_alleDagen_alleAspecten)  
    
    } else {
      console.log('hghDat == null')
    }
  }   

  const changeSliderDate = (deltaDays) => {
    setSliderEndDate_asTxt(get_changedDate_asTxt(sliderEndDate_asTxt, deltaDays))
 }
  
  async function getData() {
    const postData = new FormData();
    //console.log('100 myUsers useffect 1 .. ')   
    postData.append ('username', username);
    postData.append('apikey', apikey);
    postData.append('startDate', get_changedDate_asTxt(sliderEndDate_asTxt, periode*-1));
    postData.append('endDate', sliderEndDate_asTxt);
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
      setMessage(res['hghPeriode']['messages'][0])
      setHghData_old(res['hghPeriode']['data'])
     
      createSliderWeek(res['hghPeriode']['dataPerAspect']) // with hghData

      setHghData(res['hghPeriode']['dataPerAspect'])

      let sliderAspectTmp = res['aspectLijst_user']['aspecten']
      setSliderAspect(Object.values(sliderAspectTmp)[0]['aspect'])
      
    })
  }, [sliderEndDate_asTxt] ) 

  const colorClassNameGenerator = (n) => {
    return "color_" + n
  }

  const editCell = (aspect, datum) => {
    alert (aspect +  " " + datum  )
    //alert (JSON.stringify(event.target))
  }

  const callBackWaarde = useCallback((waarde) => {
    console.log ('callBackWaarde aangeroepen:  ' + waarde)
  },[])

  return (
    <>
      <Table key="slidermenu" striped bordered hover variant="light" size="sm"> 
          <tr>
            <td key="slider_dateMenuRow_back"> 
              <Button onClick={ () => changeSliderDate( periode *-1 ) }>
                🡸 
              </Button>
            </td> 
            <td key="slider_dateMenuRow_date">{sliderEndDate_asTxt}</td> 
            <td key="slider_dateMenuRow_forward">
              <Button onClick={ () => changeSliderDate( periode     ) }>  
                🡺 
              </Button>
            </td>
           
          </tr>  
      </Table>



      { sliderData1[0] ?
        <Table key="data" striped bordered hover variant="light" size="sm"> 
          {/*     ************************************  
                    1: Maak KOP REGELS met datums    
                  ************************************
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

          {/*     ************************************  
                  2 : Maak de data regels  
                  ************************************
          */}
        
          { sliderData1.map((dataRow, dataRowIndex) => 
            <>
              <tr>
                <td key={dataRowIndex} className='striped small'> {/* eerste kolom  */} 
                  {dataRow.aspect}
                </td>
                
                {dataRow.data.map( (dagData, dagDataIndex) => 
                  <>
                    <td key         = {dagDataIndex} 
                        data-row-id = {dagData.aspect} 
                        data-col-id = {dagData.datum} className='striped small'

                        onClick = {() => showSwal(dagData.waarde)} 
                    > 
                      {dagData.waarde>0?
                        <EditWaardeModal aspect={dagData.aspect}  waarde={dagData.waarde} />
                      : ""
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



    </>
  );  

}

Slider.propTypes = {

  // value: propTypes.string.isRequired,
  // callBack_myUsers_from_editRole: propTypes.func.isRequired
  }

  

export default Slider;