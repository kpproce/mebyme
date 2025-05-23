import React, { useState, useEffect } from "react";
import { basic_API_url } from "./global_const.js";
import propTypes from "prop-types";
import {  Modal, Form, Table, Row, Col, Button } from "react-bootstrap";
import { Check, X } from "lucide-react";
import NewAspectModal from "./NewAspectModal";

const  ChangeAspectInstellingModal = ({ username, apikey }) => {
    // const [id, setId] =  useState(1);
    // const [title, setTitle] =  useState("this song");
    const [show, setShow]       = useState(false);
    const [close, setClose]     = useState(false);
    const [opslaan, setOpslaan] = useState(false);
        
    useEffect(() => {
      if (close === true) {
        const timer = setTimeout(() => {
          setShow(false);
        }, 1500); // Sluit na xx milli seconden
    
        return () => clearTimeout(timer); // Voorkomt geheugenlekken
      }
    }, [close]);
  
    const [aspectenData, setAspectenData] = useState([]);

    const updateAspectenData = async (username, apikey) => {
      const postData = new FormData();
      const fetchURL = basic_API_url() + "php/mebyme.php";

      postData.append("username", username);
      postData.append("apikey", apikey);
      console.log('19: aspectenData')
      console.log(aspectenData.aspectenLijst)
      postData.append("aspectenData", JSON.stringify(aspectenData.aspectenLijst));
      postData.append("action", "update_aspectenData");

      const requestOptions = { method: "POST", body: postData };
      try {
        const res = await fetch(fetchURL, requestOptions);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return await res.json();
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    };

    const getAspectenData = async (username, apikey) => {
      const postData = new FormData();
      const fetchURL = basic_API_url() + "php/mebyme.php";
      postData.append("username", username);
      postData.append("apikey", apikey);
      postData.append("action", "get_alle_aspecten");

      const requestOptions = { method: "POST", body: postData };
      try {
        const res = await fetch(fetchURL, requestOptions);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return await res.json();
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    };
  
    useEffect(() => {
      const fetchData = async () => {
        const data = await getAspectenData(username, apikey);
        setAspectenData(data || []);
      };
      fetchData();
    }, [username, apikey]);

    const handleJaNeeChange = (index, newValue) => {
      const newData = [...aspectenData.aspectenLijst];
      newData[index].dagdelenInvullen = newValue;
      setAspectenData({ ...aspectenData, aspectenLijst: newData });
    };

    const handleAantalChange = (index, newValue) => {
      const newData = [...aspectenData.aspectenLijst];
      console.log(86,newValue)
      newData[index].aantalDagdelenBijAutoInvullen	 = newValue;
      setAspectenData({ ...aspectenData, aspectenLijst: newData });
    };

    const handleRapport_orderChange = (index, newValue) => {
      const newData = [...aspectenData.aspectenLijst];
      console.log("90: handleRapport_orderChange: " + newValue)
      newData[index].rapport_order	 = newValue;
      setAspectenData({ ...aspectenData, aspectenLijst: newData });
    };
    
    const handleShow  = () => { setShow(true); setClose(false) }
    const handleClose = () => { setShow(false) }

    const handleAnnuleer = async () => {
      const data = await getAspectenData(username, apikey);
      setAspectenData(data || []);
      setClose(true)
      setOpslaan(false)
    };

    const handleOpslaanEnSluit = async () => {
      await updateAspectenData(username, apikey)
      setOpslaan(true)
      setClose(true)
    };

    return (
      <>
        <Button onClick={handleShow}>
          beheer aspecten: invoer dagdeel of per dag
        </Button>

        <Modal  show={show} onHide={handleClose} active="true" backdrop={false}>
          <Modal.Header className="modalBody" >
            <Modal.Title>
              <div> invoer dagdeel of per dag? </div>
              
            </Modal.Title>  
            <span className = "buttonRight">
              <Button  variant="primary" onClick={handleAnnuleer} > <X size={24} color="red" /> </Button>
              <Button  variant="primary" onClick={handleOpslaanEnSluit} > <Check size={24} color="lightgreen" /> </Button>
            </span>
          </Modal.Header>
        
          <Modal.Body className="modalBody"> 
          
            {close
              ? 
                <h2>
                  {opslaan? <> wijzigingen Opgeslagen</>:<> wijzigingen NIET opgeslagen</>} 
                </h2>
              :
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <h1 style={{ fontSize: "x-large" }}>instellingen</h1>
                  <Table striped bordered hover>
                    <thead style={{ position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 1 }}>
                      <tr>
                        <th>#</th>
                        <th>Aspect</th>
                        <th>Alle dagdelen invullen?</th>
                        <th>aantal Bij auto?</th>
                        <th>volgorde kalender ?</th>

                      </tr>
                    </thead>
                    <tbody>
                      {aspectenData.aspectenLijst ? (
                        aspectenData.aspectenLijst.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.aspect.length > 15 ? item.aspect.substring(0, 15) + "..." : item.aspect}</td>
                            <td>
                              <Row className="align-items-center">
                                <Col xs="auto">
                                  <Form.Select
                                    value={item.dagdelenInvullen}
                                    onChange={(e) => handleJaNeeChange(index, e.target.value)}
                                  >
                                    <option value="ja">Ja</option>
                                    <option value="nee">Nee </option>
                                  </Form.Select>
                                </Col>
                                
                              </Row>
                            </td>
                            <td>
                              <Row className="align-items-center">
                                <Col xs="auto">
                                  <Form.Select
                                    value={item.aantalDagdelenBijAutoInvullen}
                                    onChange={(e) => handleAantalChange(index, e.target.value)}
                                  >
                                    <option value="1">1 </option>
                                    <option value="5">5 </option>
                                  </Form.Select>
                                </Col>
                                
                              </Row>
                            </td>

                            <td>
                              <Row className="align-items-center">
                                <Col xs="auto">
                                  <input 
                                    className = "small"
                                    style={{
                                      width: window.innerWidth < window.innerHeight ? "50px" : "70px", // 50px voor portret, 70px voor landschap
                                    }}
                                    type = "number"
                                    value={item.rapport_order}
                                    onChange={(e) => handleRapport_orderChange(index, e.target.value)}
                                   /> 
                                </Col>
                                
                              </Row>
                            </td>

                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3">Geen data</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
            }
          <NewAspectModal
             username={username}
             apikey={apikey}
             dagdelenInvullen={'ja'}
          />
          </Modal.Body>
          <Modal.Footer>     
            {close 
              ?
                <>formulier wordt gesloten</> 
              : 
                <>  
                  <Button variant="secondary" onClick={handleAnnuleer}>
                    Annuleer (<X size={24} color="red" />)
                  </Button>

                  <Button variant="primary" onClick={handleOpslaanEnSluit}>
                    Opslaan (<Check size={24} color="lightgreen" />)
                  </Button>
                </>
              
             
            }
            </Modal.Footer>
        
        </Modal>
      </>
    )
  }

  ChangeAspectInstellingModal.propTypes = {
    username          : propTypes.string, 
    apikey 	          : propTypes.string,


    callBack_ChangeAspectInstellingModal : propTypes.func
  }
  
  export default ChangeAspectInstellingModal; 