import {useState, useEffect} from 'react';
import { Modal, Table, Button} from "react-bootstrap";
import Select from 'react-select';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import propTypes from 'prop-types'; // ES6
import { BsEye } from "react-icons/bs";
import { FaRegEyeSlash } from "react-icons/fa";
import { FaCog } from "react-icons/fa";

const  ChangeSliderVisibility = (props) => {
    // const [id, setId] =  useState(1);
    // const [title, setTitle] =  useState("this song");
    const [show, setShow] = useState(false);

    const [dataArray, setDataArray] = useState(props.aspectLijst.filter( (item) => item.aspect_type === props.teTonenAspectType))

    const handleShow = () => { setShow(true) }
    const handleClose = () => { 
      props.callBack_changeSliderVisibility(true);
      setShow(false) 
    }

    /*   const handleSaveAndClose = () => { 
      handleSave();
      handleClose(); 
    }; */

    async function update_bijInvoerTonen_via_API(aspect, bijInvoerTonen, action) { // action == koppel aspect of update 
      const postData = new FormData();
            //console.log('100 myUsers useffect 1 .. ')   
      postData.append('username', props.username);
      postData.append('apikey',   props.apikey);
      postData.append('aspect',   aspect);
      postData.append('bijInvoerTonen',   bijInvoerTonen);
      console.log('36: ' + action )
      if (action=="koppel")    
        postData.append('action',  'koppel_aspect_aan_1user')
      else 
        postData.append('action',  'update_aspect_bijInvoerTonen_1User');
  
      let requestOptions = {
        method: 'POST',
        body: postData,
      };
      const res = await fetch(props.fetchURL, requestOptions);   
      if (!res.ok) { throw res;}

      return res.json();
    } 

    async function update_aspect_dagwaardeBerekening_via_API(aspect, dagwaardeBerekening) { // action == koppel aspect of update 
      const postData = new FormData();
            //console.log('100 myUsers useffect 1 .. ')   
      postData.append('username'            , props.username)
      postData.append('apikey'              , props.apikey)
      postData.append('aspect'              , aspect)
      postData.append('dagwaardeBerekening' , dagwaardeBerekening);
      postData.append('action'              , 'update_aspect_dagwaardeBerekening')
      
      let requestOptions = {
        method: 'POST',
        body: postData,
      };
      const res = await fetch(props.fetchURL, requestOptions)   
      if (!res.ok) { throw res;}

      return res.json();
    } 

    useEffect(() => { 
      // 
    },  [show]) 

    
    const handleSelectChange = (aspect, dagwaardeBerekening) => {
      update_aspect_dagwaardeBerekening_via_API(aspect, dagwaardeBerekening) 
      
      props.callBack_changeSliderVisibility(true);
    };


    const handleClick_visibilityChange_button = (aspect, bijInvoerTonen, action) => {
      update_bijInvoerTonen_via_API(aspect, bijInvoerTonen=='ja'?'kan':'ja', action) 
      props.callBack_changeSliderVisibility(true);
    }
    const customStyles = {   control: (provided) => ({
      ...provided,
      backgroundColor: 'rgb(50,60,180)', // Background color
      display: 'flex',
      flexDirection: 'column', // Align items in a column
      alignItems: 'center', // Center items horizontally
      justifyContent: 'center', // Center items vertically
      padding: '0',
      minHeight: '40px', // Set a minimum height if needed
    }),}

    return (
      <>
        <BsEye
          //style={{ padding_top: '0px'}}
          size  = "1.2rem"
          color = "orange" 
          onClick={handleShow}
        />

        <Modal  show={show} onHide={handleClose} active="true" backdrop={false}>
          <Modal.Header className="modalBody" >
            <Modal.Title>
              <div> Welke aspecten wil je zien? </div>
              
            </Modal.Title>  
            <Button className="buttonRight" variant="primary" onClick={handleClose} > X </Button>
          </Modal.Header>
        
          <Modal.Body className="modalBody"> 
            <Tabs>
              <TabList>
                <Tab>Jouw Aspecten {props.teTonenAspectType }</Tab>
                <Tab >Overige aspecten</Tab>
              </TabList>

              <TabPanel>
                              
                <Table key="table_jouw_aspecten" striped bordered hover size="sm">       
                  <thead>
                    <tr key='tr_jouw_aspecten'>
                      <th key="head_jouw_aspect_aspect">Aspect</th>
                      <th key="head_jouw_aspect_tonen">Tonen</th>
                      <th key="head_jouw_aspect_wijzig">bereken dag</th>
                    </tr>    
                  </thead> 
                  <tbody>
                   
                    {dataArray.map((aspectDetails, aspectIndex) => 
                          <tr key={"tr_jouwAspecten" + aspectIndex}>
                            <td key= {"td_jouwAspecten" + aspectIndex + "_aspect_aspect"}> { aspectDetails.aspect }       </td>
                            <td key= {"td_jouwAspecten" + aspectIndex + "_aspect_tonen"}> { 
                                <Button
                                  className= 'buttonEyeAanUit'
                                  onClick = { 
                                    () => handleClick_visibilityChange_button(aspectDetails.aspect, aspectDetails.bijInvoerTonen, 'update') 
                                  }
                                >
                                  {aspectDetails.bijInvoerTonen=='ja'?
                                    <BsEye
                                      //style={{ padding_top: '0px'}}
                                      size  = "1rem"
                                      color = "green" 
                                    />:
                                    <FaRegEyeSlash
                                      size  = "1rem"
                                      color = "red" 
                                    />
                                  }     
                                </Button>
                              } 
                            </td>
                            <td key= {"td_jouwAspecten" + aspectIndex + "_aspect_tonen"}> { 
                              <select 
                                className = "form-control" 
                                id        = {aspectDetails.dagwaardeBerekening}
                                value     = {aspectDetails.dagwaardeBerekening}
                                onChange  = {
                                  //() => handleClick_visibilityChange_button(aspectDetails.aspect, aspectDetails.bijInvoerTonen, 'update') 
                                  () => { 
                                      console.log('160')
                                      console.log()
                                      handleSelectChange(aspectDetails.aspect, event.target.value)
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
                            } 
                            </td>
                          </tr>

                        // : <Fragment> 
                        //     {console.log('104: nee')} <tr><td>--</td><td>--</td><td>--</td></tr>
                        //   </Fragment>
                      // }
                    )}
                  </tbody>
              
                </Table>
              </TabPanel>

              <TabPanel>
              <p>Aspecten die (nog) niet aan jou gekoppeld zijn als user</p>
              <Table key="table_overige_aspecten" striped bordered hover size="sm">       
                <tr key='tr_overige_aspecten'>
                  <th key="head_overige_aspecten_type">Type</th>
                  <th key="head_overige_aspecten_aspect">Aspect</th>
                  <th key="head_overige_aspecten_tonen">Tonen</th>
                </tr>     
                {props.overigeAspecten.map((aspectDetails, aspectIndex) => 
                    <tr key={"tr_overig_" + aspectIndex}>
                      <td key= {"td_overigeAspecten" + aspectIndex + "_aspect_type"} > { aspectDetails.aspect_type } </td>
                      <td key= {"td_overigeAspecten" + aspectIndex + "_aspect_aspect"}> { aspectDetails.aspect }       </td>
                      <td key= {aspectIndex + "_aspect_tonen"}> { 
                        <Button
                          
                          onClick = { 
                            () => handleClick_visibilityChange_button(aspectDetails.aspect, aspectDetails.bijInvoerTonen, 'koppel') 
                          }
                          
                          style={
                            { backgroundColor: "#FF1493", 
                              borderColor: "#FF1493" }
                          }
                        
                        >
                          {aspectDetails.bijInvoerTonen=='ja'?
                            <BsEye
                              //style={{ padding_top: '0px'}}
                              size  = "1rem"
                              color = "green" 
                            />:
                            <FaRegEyeSlash
                              size  = "1rem"
                              color = "red" 
                            />
                          }     
                        </Button>
                      } </td>
                    </tr>
                )}
              
                </Table>
              </TabPanel>
            </Tabs>

            {/* <UploadFile callback_uploadModal_fileChanged ={callback_uploadModal_fileChanged}/> */}
          </Modal.Body>
          <Modal.Footer>     
         
            <Button variant="primary" onClick={handleClose}>
              Close
            </Button>
            </Modal.Footer>
        
        </Modal>
      </>
    )
  }

  ChangeSliderVisibility.propTypes = {
    teTonenAspectType : propTypes.string,
    aspectLijst       : propTypes.array, 
    overigeAspecten   : propTypes.array, 
    username          : propTypes.string, 
    apikey 	          : propTypes.string,
    berekenmethodes   : propTypes.array,
    aspect            : propTypes.string, 
    fetchURL          : propTypes.string,

    callBack_changeSliderVisibility : propTypes.func
  }
  
  export default ChangeSliderVisibility; 