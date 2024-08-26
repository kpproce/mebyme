import {useState, useEffect, useCallback  } from 'react'
import Table from 'react-bootstrap/Table';


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

  
  const [sliderStartDate_asTxt, setSliderStartDate_asTxt] = useState("2024-06-12")
  const [sliderEndDate_asTxt, setSliderEndDate_asTxt] = useState("2024-06-24")

  const [sliderData, setSliderData] = useState([])

  const [sliderDateRow, setSliderDateRow] = useState([])
  const [sliderDataRow, setSliderDataRow] = useState([])

  const [apikey, setApikey] = useState(() => {
    // let apikey = window.localStorage.getItem('apikey')
    let apikey = props.apikey
    return apikey ? apikey :'guestapikey2' // standaard 
  })
  
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


  function tomorrow_txt (dateNow_txt) {
    // 1 creete Date from input
    let tomorrow = new Date (dateNow_txt)
    tomorrow.setDate(tomorrow.getDate() + 1)
    let jaar =  tomorrow.getFullYear()
    let maand = tomorrow.getMonth() + 1
    let dag =   tomorrow.getDate() 
    if (maand<10) maand = "0" + maand
    if (dag<10) dag  = "0" + dag
    return (jaar + '-' + maand + '-' + dag) 
    // return tomorrow.getFullYear() + "-" + (tomorrow.getMonth() + 1 ) + "-" + tomorrow.getDate()
    //return tomorrow.toLocaleDateString('nl-NL', { year:"numeric",  month:"2-digit" , weekday: '2-digit', })
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

  function maakWaardesRow( hghRow, startDate, endDate ) {
    //  In:    een array met objecten, {}

    //  Doen: Voor iedere datum van startDate tot en met endDate een waarde oernemen uit de hghRow. 
    //        Als op bepaalde datum geen waarde staat dan wordt 0 opgenomen.  

    //  Uit:   een array met waardes per datum 1 
    //         Bijv: waardesRow = [3, 5, 3, 2, 3, 1, 1, 2, 0, 0, 4, 0,2] 

       let waardesRow = [3, 5, 3, 2, 3, 1, 1, 2, 0, 0, 4, 0,2] 
    return waardesRow
  }

  function createSliderWeek (hghData) {
    // in: HghData per aspect 
    
    console.log('95 hghData')
    console.log(hghData)

    if (hghData) {
      
      // ********************************************* 
      // creeer een array met alle datums uit periode--> dateRow
      // ********************************************* 
      
      let dateRow = []
      let loopDatum = sliderStartDate_asTxt;
      console.log ('115a startDatum : ' + sliderStartDate_asTxt )

      dateRow.push(loopDatum)
      while (loopDatum<sliderEndDate_asTxt) {
          //console.log (' 75b loopDatum : '  + loopDatum )
        loopDatum = tomorrow_txt(loopDatum)
        dateRow.push(loopDatum)
      }

      console.log ('115b loopDatum : '  + loopDatum )
      console.log ('115c EINDE **** ')
      console.log ('115c EINDE **** ')
      console.log ('115d startDatum : ' + sliderStartDate_asTxt + ' loopDatum : '  + loopDatum + ' eindDatum: ' + sliderEndDate_asTxt)
      
      setSliderDateRow(dateRow)
      console.log ('115: dateRow')
      console.log (dateRow)

      //     DE DATA 
        let sliderDataRows = []
        hghData.forEach( hghRow => {
            
            sliderDataRows.push([
              {'item'    : 'aspect'},
              {'naam'    : hghRow.aspect},
              {'waardes' : maakWaardesRow( hghRow.data, sliderStartDate_asTxt, sliderStartDate_asTxt ) }
            ])
        })
        console.log ('130: sliderDataRows')
        console.log (sliderDataRows)
   
    
    } else {
      console.log('hghDat == null')
    }
  
  }   
  
  async function getData() {
    const postData = new FormData();
    //console.log('100 myUsers useffect 1 .. ')   
    postData.append ('username', username);
    postData.append('apikey', apikey);
    postData.append('startDate', sliderStartDate_asTxt);
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

      let sliderData_tmp = [ 
        { 'sliderDatesRow':   // altijd zelfde aantal items als data. Alle datums gevuld!! 
          ['2024-06-18', '2024-06-19', '2024-06-20', '2024-06-18', '2024-06-21', '2024-06-22', '2024-06-23']},
        
          {'sliderDataRows': //geen data invullen 0. Wel invullen is 1 ..5 
          [
            [ {item: 'aspect'} , {naam: 'deze dag'} , {waardes: [2, 4, 1, 0, 4, 5, 1]} ],
            [ {item: 'aspect'} , {naam: 'benauwd'}  , {waardes: [2, 3, 1, 2, 4, 1, 5]} ],
            [ {item: 'middel'} , {naam: 'basis_med'}, {waardes: [1, 1, 0, 2, 4, 5, 1]} ]
          ]
        }
      ]
        
      setSliderData(sliderData_tmp)
 
      // setSliderAspect(res['aspectLijst_user']['aspecten'][0])
      
    })
  }, [] ) 

  const colorClassNameGenerator = (n) => {
    return "color_" + n
  }

  const getAspectFromItemArray = (itemArray) => {
      let aspect = "geen aspect gevonden"
      itemArray.forEach(element => {
        //console.log('145: element ObjectKey:')
        if (Object.keys(element) == "aspect" ) {
        
          aspect = Object.values(element)
        } //else console.log(Object.keys(element) + " xxxx")  
      });
    return aspect
  }

  return (
    <>

    <h2>sliderData dynamic data</h2>

    {hghData[0]?
      JSON.stringify(hghData[0].aspect)
    : 
      'geen data'
    }

    <h2>sliderData </h2>

    { sliderData[0] ?
      <Table  striped bordered hover variant="dark" size="sm"> 

        {/*  1: Maak de eerste kop regel met datums    */}
          <tr >
            <th className='striped small' key='sliderDatumKol1'>datum</th>
            { sliderData[0].sliderDatesRow.map ( (date, dateIndex) => 
                <th className='striped x-small' key={dateIndex}>    
                  {txtDateFormat(date,'dagNr_maandNaamKort')}
                </th>
            )}
          </tr>

        {/*  2 : Maak de data regels   */}

        { sliderData[1].sliderDataRows.map((dataRow, dataRowIndex) => 
            <>
              <tr>
                <td key={dataRowIndex} className='striped small'> 
                  {dataRow[1].naam }
                </td>
                
                {dataRow[2].waardes.map( (waarde, dataIndex) => 
                
                  <td key={dataIndex} className='striped small'> 
                      {waarde>0? 
                        <span className = {colorClassNameGenerator(waarde)}> {getIcon(waarde)} </span>
                      : ""
                     }
                  </td>
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