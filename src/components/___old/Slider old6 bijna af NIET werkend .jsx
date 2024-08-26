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
  const [sliderData1, setSliderData1] = useState([])

  const [sliderData2, setSliderData2] = useState([])

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
 

    if (hghData) {
    
      // *********************************************************
      // creeer een array met alle datums uit periode--> datesRow
      // *********************************************************
      
      let datesRow = []
      let loopDatum = sliderStartDate_asTxt;
      console.log ('115a startDatum : ' + sliderStartDate_asTxt )

      datesRow.push(loopDatum)
      while (loopDatum<sliderEndDate_asTxt) {
          //console.log (' 75b loopDatum : '  + loopDatum )
        loopDatum = tomorrow_txt(loopDatum)
        datesRow.push(loopDatum)
      }

      console.log ('115b loopDatum : '  + loopDatum )
      console.log ('115c EINDE **** ')
      console.log ('115c EINDE **** ')
      console.log ('115d startDatum : ' + sliderStartDate_asTxt + ' loopDatum : '  + loopDatum + ' eindDatum: ' + sliderEndDate_asTxt)
      
     // setSliderdatesRow(datesRow)
      console.log ('115: datesRow')
      console.log (datesRow)
      
      // **********************************************************************************
      // Maak een nieuwe array hghData_alleDagen_alleAspecten,  

      //        De lijsten datesRow hghData zijn beide gesorteerd op datum, 
      //        Je loopt per aspect beide lijsten tegelijk door.
      //        ontbreekt er een datum dan wordt die in de nieuw array toegevoegd met waarde 0 
      
      // ***********************************************************************************

      let hghData_alleDagen_alleAspecten = []
      // doorloop alle aspecten uit de hghData:

      hghData.forEach( hghRow => {
        console.log('149a aspect: ' +  hghRow.data[0].aspect) // dit is het aspect
        console.log('149b data: ') 
        console.log(hghRow.data)   // de data

        let loopRowIndex = 0  
        console.log('149d rowdatums: '  + hghRow.data[0].aspect) 
        
        let hghData_alleDagen = [] // lege dataRow
        datesRow.forEach(date => {
          console.log({'149e: datum': date})
          console.log(hghRow.data[loopRowIndex])
          if (date == hghRow.data[loopRowIndex].datum) {
            console.log('160: ' + date + ' GELIJK  ' + hghRow.data[loopRowIndex].datum)
            
            let dataObject = {
              'datum'  : date, 
              'aspect' : hghRow.data[0].aspect,
              'waarde' : hghRow.data[loopRowIndex].waarde
            }
            hghData_alleDagen.push( dataObject )

            console.log('168 '+ typeof(hghRow.data))
            let len = Object.keys(hghRow.data).length
            console.log("LEN: " + len)
            if (loopRowIndex <  len-1) loopRowIndex +=1
          
          } else {
            let dataObject = {
              'datum'  : date, 
              'aspect' : hghRow.data[0].aspect,
              'waarde' : 0
            }
            hghData_alleDagen.push( dataObject )

            console.log('180: ' + date + ' xxxx niet gelijk aan ' + hghRow.data[loopRowIndex].datum)
          }
        })
      
        console.log('184 hghData_alleDagen van ' + hghRow.data[0].aspect)
        hghData_alleDagen.forEach(dagData => { 

          console.log(dagData)
          // console.log(dagData[0].datum +  "  "  + dagData[1].waarde)
        })

        hghData_alleDagen_alleAspecten.push({'aspect': hghRow.data[0].aspect , 'data' : hghData_alleDagen }

        )
      })
      
      console.log('196 hghData_alleDagen_alle_aspecten')
      hghData_alleDagen_alleAspecten.forEach(dagData => { 
        console.log(dagData)
      })
    

      console.log('204: hghData')
      console.log(hghData)

      console.log ('204: gecreeerde data (hghData_alleDagen_alleAspecten)')
      console.log (hghData_alleDagen_alleAspecten)
   

      setSliderData1 (hghData_alleDagen_alleAspecten)
      
    
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

      let sliderDataRows =  // waarde is 1 ..5 geen waarde ingevuld = 0  
            [
              [ {aspect: 'deze dag'} , 
                {waardes: 
                  [
                    [ {datum: '2024-06-18'}, {waarde: 2} ], 
                    [ {datum: '2024-06-19'}, {waarde: 1} ], 
                    [ {datum: '2024-06-20'}, {waarde: 1} ], 
                    [ {datum: '2024-06-21'}, {waarde: 3} ], 
                    [ {datum: '2024-06-22'}, {waarde: 3} ], 
                    [ {datum: '2024-06-23'}, {waarde: 2} ], 
                    [ {datum: '2024-06-24'}, {waarde: 1} ]
                  ]
                }
              ],
              [ {aspect: 'benauwd'}, 
                {waardes: 
                  [
                    [ {datum: '2024-06-18'}, {waarde: 0} ], 
                    [ {datum: '2024-06-19'}, {waarde: 0} ], 
                    [ {datum: '2024-06-20'}, {waarde: 2} ], 
                    [ {datum: '2024-06-21'}, {waarde: 3} ], 
                    [ {datum: '2024-06-22'}, {waarde: 4} ], 
                    [ {datum: '2024-06-23'}, {waarde: 0} ], 
                    [ {datum: '2024-06-24'}, {waarde: 0} ]
                  ]
                }
              ]
            ]
            
      setSliderData(sliderDataRows)
 
      let sliderDataRows1 =  // waarde is 1 ..5 geen waarde ingevuld = 0  

        [ { aspect: 'deze dag' , 
            waardes:   
               [ {datum: '2024-06-18', aspect: 'deze dag', waarde: 2}, 
                 {datum: '2024-06-19', aspect: 'deze dag', waarde: 0}, 
                 {datum: '2024-06-20', aspect: 'deze dag', waarde: 2}, 
                 {datum: '2024-06-21', aspect: 'deze dag', waarde: 0}, 
                 {datum: '2024-06-22', aspect: 'deze dag', waarde: 3}, 
                 {datum: '2024-06-23', aspect: 'deze dag', waarde: 2}, 
                 {datum: '2024-06-24', aspect: 'deze dag', waarde: 1}
              ]
          },
          { aspect: 'benauwd' , 
            waardes:   
               [{datum: '2024-06-18', aspect: 'benauwd', waarde: 0}, 
                {datum: '2024-06-19', aspect: 'benauwd', waarde: 1}, 
                {datum: '2024-06-20', aspect: 'benauwd', waarde: 0}, 
                {datum: '2024-06-21', aspect: 'benauwd', waarde: 3}, 
                {datum: '2024-06-22', aspect: 'benauwd', waarde: 3}, 
                {datum: '2024-06-23', aspect: 'benauwd', waarde: 0}, 
                {datum: '2024-06-24', aspect: 'benauwd', waarde: 1}
               ]   
          }
        ]
      
        // setSliderData1(sliderDataRows1)
 

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

  function get_DatesArray_from_dataRows(myDataRows) {
    console.log('303a ')
    console.log(myDataRows)
    let datesRow = []
    myDataRows.forEach (row => {
      console.log(Object.keys(row))
      console.log('303b ')
      console.log(row)
      if (Object.keys(row).includes("waardes") ) {
        row['waardes'].forEach(waardeObject => datesRow.push(waardeObject[0]['datum']))
      } 
    })
    console.log('303c ')
    console.log(datesRow)
    return datesRow
  }

  function get_Aspect_from_dataRow(myDataRow) {
    console.log('320a')
    console.log(myDataRow)
    let aspect = "-"
    myDataRow.forEach (row => {
      console.log(Object.keys(row))
      console.log('320b ')
      console.log(row)
      if (Object.keys(row).includes("aspect") ) {
        aspect=row['aspect']
      } 
    })
    console.log('320c ')
    console.log(aspect)
    return aspect
  }



  return (
    <>

    <h2>sliderData dynamic data</h2>


    <h2>sliderData </h2>

    { sliderData[0] ?
      <Table  striped bordered hover variant="dark" size="sm"> 

        {/*     ************************************  
                   1: Maak KOP REGELS met datums    
                ************************************
        */}

           <tr>
           {console.log("358: ")}
           {console.log(sliderData[0])}
            <th className='striped small' key='sliderDatumKol1'>datum</th>
            { get_DatesArray_from_dataRows(sliderData[0]).map (
                (date, dateIndex) => 
                  <th className='striped x-small' key={dateIndex}>    
                    {txtDateFormat(date,'dagNr_maandNaamKort')}
                  </th>
              )
            }
          </tr>

        {/*  2 : Maak de data regels   */}

        { sliderData.map((dataRow, dataRowIndex) => 
          <>
            { console.log('374') }
            { console.log(sliderData) }
            
            <tr>
              <td key={dataRowIndex} className='striped small'> 
                {get_Aspect_from_dataRow(dataRow)}
                {console.log('380:') }
                {console.log(dataRow) }

              </td>
              
              {dataRow[1].waardes.map( (waardeData, dataIndex) => 
                <>
                  <td key={dataIndex} className='striped small'> 

                    {waardeData[1].waarde>0?
                      <span className = {colorClassNameGenerator(waardeData[1].waarde)}> {getIcon(waardeData[1].waarde)} </span>
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

<h2>sliderData versie 1 </h2>

{ sliderData1[0] ?
      <Table  striped bordered hover variant="dark" size="sm"> 

        {/*     ************************************  
                   1: Maak KOP REGELS met datums    
                ************************************
        */}

           <tr>
           {console.log("447: ")}
           {console.log(sliderData1[0].waardes)}
           {console.log(sliderData1[0].waardes[0].datum)}
            <th className='striped small' key='sliderDatumKol1'>datum</th>
            { sliderData1[0].waardes.map((item, itemIndex) => 
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
            { console.log('462: aspect: ' + dataRow.aspect) }
            { console.log(dataRow.waardes) }
          </>
        )}


        { sliderData1.map((dataRow, dataRowIndex) => 
          <>
            { console.log('470:') }
            { console.log(sliderData) }
            
            <tr>
              <td key={dataRowIndex} className='striped small'> 
                {dataRow.aspect}
              </td>
              
              {dataRow.waardes.map( (dagData, dagDataIndex) => 
                  <td key={dagDataIndex} className='striped small'> 
                    {dagData.waarde>0?
                      <span className = {colorClassNameGenerator(dagData.waarde)}> {getIcon(dagData.waarde)} </span>
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