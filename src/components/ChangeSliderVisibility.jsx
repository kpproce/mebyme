import {useState, useEffect} from 'react';
import { Modal, Table, Button} from "react-bootstrap";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import propTypes from 'prop-types'; // ES6
import { BsEye } from "react-icons/bs";
import { FaRegEyeSlash } from "react-icons/fa";

const  ChangeSliderVisibility = (props) => {
    // const [id, setId] =  useState(1);
    // const [title, setTitle] =  useState("this song");
    const [show, setShow] = useState(false);

    const handleShow = () => { setShow(true) }
    const handleClose = () => { setShow(false) }

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
        postData.append('action',  'koppel_aspect_aan_1User')
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

    useEffect(() => { 
      // 
    },  [show]) 

    const handleClick_visibilityChange_button = (aspect, bijInvoerTonen, action) => {
      update_bijInvoerTonen_via_API(aspect, bijInvoerTonen=='ja'?'kan':'ja', action) 
      props.callBack_changeSliderVisibility(true);
    }

    return (
      <>
        <BsEye
          //style={{ padding_top: '0px'}}
          size  = "1.2rem"
          color = "orange" 
          onClick={handleShow}
        />


        <Modal  show={show} onHide={handleClose} active="true" backdrop={false}>
          <Modal.Header>
            <Modal.Title>
              <div> Welke aspecten wil je zien? </div>
              
            </Modal.Title>  
            <Button className="buttonRight" variant="primary" onClick={handleClose} > X </Button>
          </Modal.Header>
        
          <Modal.Body> 
            <Tabs>
              <TabList>
                <Tab>Jouw Aspecten {props.teTonenAspectType }</Tab>
                <Tab >Overige aspecten</Tab>
              </TabList>

              <TabPanel>
                <Table key="table_jouw_aspecten" striped bordered hover size="sm">       
                  <thead>
                    <tr key='tr_jouw_aspecten'>
                      <th key="head_jouw_aspect_type">Type</th>
                      <th key="head_jouw_aspect_aspect">Aspect</th>
                      <th key="head_jouw_aspect_tonen">Tonen</th>
                    </tr>    
                  </thead> 
                  <tbody>
                    {props.aspectLijst.map((aspectDetails, aspectIndex) => 
                      // {props.teTonenAspectType.localeCompare(aspectDetails.aspect_type)==0 ? // dit werkt niet, begrijp niet waarom niet. Oplossing is de data aanpassen
                          <tr key={"tr_jouwAspecten" + aspectIndex}>
                            <td key= {"td_jouwAspecten" + aspectIndex + "_aspect_type"} > { aspectDetails.aspect_type } </td>
                            <td key= {"td_jouwAspecten" + aspectIndex + "_aspect_aspect"}> { aspectDetails.aspect }       </td>
                            <td key= {"td_jouwAspecten" + aspectIndex + "_aspect_tonen"}> { 
                              <Button
                                className= 'buttonEyeAanUit'
                                onClick={ 
                                  () => handleClick_visibilityChange_button(aspectDetails.aspect, aspectDetails.bijInvoerTonen, 'update') 
                                }>
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

                        // : <Fragment> 
                        //     {console.log('104: nee')} <tr><td>--</td><td>--</td><td>--</td></tr>
                        //   </Fragment>
                      // }
                    )}
                  </tbody>
              
                </Table>
              </TabPanel>

              <TabPanel>
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
    aspect            : propTypes.string, 
    fetchURL          : propTypes.string,

    callBack_changeSliderVisibility : propTypes.func
  }
  
  export default ChangeSliderVisibility; 