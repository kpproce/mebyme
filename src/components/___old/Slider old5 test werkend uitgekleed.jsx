import {useState, useEffect, useCallback  } from 'react'
import Table from 'react-bootstrap/Table';


// import DeleteUser from './deleteUser.jsx';
// import EditUser from './editUser.jsx';
// import EditRole from './editRole.jsx';


const Slider = (props) => { 

  const [teller, setTeller] = useState(0)
  const fetchURL = "http://localhost/mebyme/php/mebyme.php"

  const [hghData, setHghData] = useState([]);
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

  const createSliderWeek = (data) => {
    // hgh_Date
    setTeller( teller + 1 )
    console.log('92: hgh_Data ' + teller)
    console.log(data)
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
      setHghData(res['hghPeriode']['data'])
     
      createSliderWeek(res['hghPeriode']['data']) // with hghData

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

    <h2>sliderData</h2>

          
    
    <h3>{typeof(hghData)}</h3>

    {Object.values(hghData).map((dataRow,rowIndex) => 
        <p key={rowIndex}> 
          aspect: {dataRow.aspect} datum: {dataRow.datum} waarde {dataRow.waarde} 
        </p>
       
      
       
      
    )} 


    </>
  );  

}

Slider.propTypes = {

  // value: propTypes.string.isRequired,
  // callBack_myUsers_from_editRole: propTypes.func.isRequired
  }

export default Slider;