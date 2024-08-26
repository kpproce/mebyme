import {useState, useEffect, useCallback  } from 'react'
import Table from 'react-bootstrap/Table';


// import DeleteUser from './deleteUser.jsx';
// import EditUser from './editUser.jsx';
// import EditRole from './editRole.jsx';


const Slider = (props) => { 

  const fetchURL = "http://localhost/mebyme/php/mebyme.php"

  const [hghData, setHghData] = useState(null);
  const [message, setMessage] = useState("");

  const [username, setUsername] = useState(() => {
    let username = props.username
    return username ? username : 'guest' // standaard 
  })
  
  const [sliderAspect, setSliderAspect] = useState ("geen");

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

  function createSliderWeek (startLijst) {
    // in: HghData 

    let startDatum = "2024-06-18"
    let endDatum = "2024-06-24"
   
    let sliderData = [
      [{datum:'18 juni'}, {'aspect': 'dezedag'}, {'waarde': 1}],
      [{datum:'19 juni'}],
      [{datum:'20 juni'}, {'aspect': 'dezedag'}, {'waarde': 2}],
      [{datum:'21 juni'}, {'aspect': 'dezedag'}, {'waarde': 3}],
      [{datum:'22 juni'}, {'aspect': 'dezedag'}, {'waarde': 4}],
      [{datum:'23 juni'}, {'aspect': 'dezedag'}, {'waarde': 5}],
      [{datum:'24 juni'}, {'aspect': 'dezedag'}, {'waarde': 2}]
    ]

    let sliderData2 = [
        [ {'aspect': 'dezedag'},
          [ [{datum:'18 juni'}, {'waarde': 1}], 
            [{datum:'19 juni'}], 
            [{datum:'20 juni'}, {'waarde': 2}, {'test' : 3}], 
            [{datum:'21 juni'}, {'waarde': 3}], 
            [{datum:'22 juni'}, {'waarde': 4}], 
            [{datum:'23 juni'}, {'waarde': 5}], 
            [{datum:'24 juni'}, {'waarde': 3}]  
          ]
        ],
        [ {'aspect': 'benauwd'},
          [ [{datum:'18 juni'}, {'waarde': 3}], 
            [{datum:'19 juni'}], 
            [{datum:'20 juni'}, {'waarde': 3}], 
            [{datum:'21 juni'}, {'waarde': 2}], 
            [{datum:'22 juni'}, {'waarde': 3}], 
            [{datum:'23 juni'}, {'waarde': 2}], 
            [{datum:'24 juni'}, {'waarde': 2}]  
          ]
        ]
    ]
    let sliderData3 = [  // altijd zelfde aanta item. geen data betekent 0 
      [ {item: 'datums'} , {'data'     : 
        ['2024-06-18', '2024-06-19', '2024-06-20', '2024-06-18', '2024-06-21', '2024-06-22', '2024-06-23']}],
      [ {item: 'aspect'} , {'dezedag'  : [2, 3, 1, 0, 4, 5, 1]} ],
      [ {item: 'aspect'} , {'benauwd'  : [2, 3, 1, 2, 4, 5, 1]} ],
      [ {item: 'middel'} , {'basis_med': [1, 1, 0, 2, 4, 5, 1]} ]
    ]
      
    setSliderData1(sliderData)
    setSliderData2(sliderData2)


    let loopDatum = startDatum;
    console.log ('75a startDatum : ' + startDatum )

    while (loopDatum<endDatum) {
      console.log (' 75b loopDatum : '  + loopDatum )
     loopDatum = tomorrow_txt(loopDatum)
    }
    console.log (' 75b loopDatum : '  + loopDatum )
    console.log ('75c EINDE **** ')
    console.log ('75d startDatum : ' + startDatum + ' loopDatum : '  + loopDatum + ' eindDatum: ' + endDatum)
 
  }   

  async function getData() {
    const postData = new FormData();
    console.log('100 myUsers useffect 1 .. ')   
    postData.append ('username', username);
    postData.append('apikey', apikey);
    postData.append('startDate', '2024-06-18');
    postData.append('endDate', '2024-06-24');
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

      
    createSliderWeek(res['hghPeriode']['data'])

      let sliderAspectTmp = res['aspectLijst_user']['aspecten']
      setSliderAspect(Object.values(sliderAspectTmp)[0]['aspect'])

      setSliderData ([
        ['datum', '18 jun', '19 jun', '20 jun', '21 jun', '22 jun', '23 jun',  '24 jun'],
        [Object.values(sliderAspectTmp)[0]['aspect'], '1', '2', '3', '4', '5', '3',  '2']
      ])

      console.log("81a: sliderData ")

 
      // setSliderAspect(res['aspectLijst_user']['aspecten'][0])
    
      
    })
  }, [] ) 

  const colorClassNameGenerator = (n) => {
    return "color_" + n
  }

  const getAspectFromItemArray = (itemArray) => {
      let aspect = "geen aspect gevonden"
      itemArray.forEach(element => {
        console.log('145: element ObjectKey:')
        if (Object.keys(element) == "aspect" ) {
          console.log(Object.keys(element) + " GEVONDEN - values: " + Object.values(element) )
          aspect = Object.values(element)
        } else
          console.log(Object.keys(element) + " xxxx")  
      });
    return aspect
  }

  return (
    <>
      {/* slider */}
      <h3> {sliderAspect}</h3>

      <Table  striped bordered hover variant="dark" size="sm"> 
        {sliderData.map(item => Object.values(item)).map((row, index) => (
          <tr key={index}>
            {row.map((cell, index1) => 
            
            <td key={index1} className='striped'>
              { row[0] == 'datum'? 
                  <span className = 'sliderDatumClass'> {cell} </span> 
                :
                  <span className = {colorClassNameGenerator(cell)}> {getIcon(cell)} </span>
              }
            </td>)          
          }
          </tr>
        ))}
      </Table>
      {console.log('sliderData1' )}
      {console.log(sliderData1)}
      {console.log('sliderData1[0][0]' )}
      {sliderData1[0]?console.log(sliderData1[0][0]):""}
      {console.log('sliderData1[0][1]' )}
      {sliderData1[0]?console.log(Object.keys(sliderData1[0][1])[0]):"" /* -> aspect */} 

      {console.log('sliderData1[0][1]' )}
      {sliderData1[0]?console.log(Object.values(sliderData1[0][1])[0]):"" /* -> dezeDag */} 
 
      {console.log('sliderData1[0][2]' )}
      {sliderData1[0]?console.log(sliderData1[0][2]):""}
     
        {console.log('181 ')} 
        { sliderData1?
            <>
              <Table striped bordered hover variant="dark" size="sm"> 
              { sliderData1.map ((itemArray, arrayIndex)  => 
                <>
                  <tr key = {arrayIndex} >
                  <td key = {arrayIndex*1000}>
                    {getAspectFromItemArray(itemArray)}
                  </td> 
                  { itemArray.map ((item, index) =>
                        <td className='striped' key={index}>
                            {item.datum} {item.aspect} {item.waarde}
                          </td>
                    )             
                  }
                  </tr>
                </> 
              )}
              </Table>
            </>
        : 'XXX'
        }

      <p>3e manier</p>

      <div>
        { sliderData2.map((aspects,index1) =>
          <>
            <h2> aspect {index1} {JSON.stringify(aspects[0].aspect)}</h2>
            
              { aspects.map( (aspect, index3) =>   
                <>
                  <div> 
                    { Array.isArray(aspect)? 
                        <>
                          <h3>de data:</h3> 

                         
                            {aspect.map((items, itemsIndex) => 
                             <Table key={itemsIndex} striped bordered hover variant="dark" size="sm"> 
                                <tr> 
                                {Object.keys(items).map((item, itemIndex) => 
                                  <td className='striped' key={itemIndex}> 
                                    --- {JSON.stringify(items)}
                                  </td>
                                )}  
                                </tr>
                                 <tr> 
                                {items.map((item, itemIndex) => 
                                  <td className='striped' key={itemIndex}> 
                                    --- {JSON.stringify(Object.keys(item))}
                                  </td>
                                )}  
                                </tr>
                              </Table>
                            )}

                        </>
                      : 
                        Object.keys(aspect) + ' is an ' + typeof(Object.keys(aspect)) 
                    }  
                  </div>
                
                

                  -----
                  { console.log('247 : ') } 
                  { console.log(aspect) }   
                </>
              )}
            )
          </>
          )
        }
      </div>
  
   


    </>
  );  

}

Slider.propTypes = {

  // value: propTypes.string.isRequired,
  // callBack_myUsers_from_editRole: propTypes.func.isRequired
  }

export default Slider;