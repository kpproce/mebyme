import React, { useState, useEffect } from "react";
import { basic_API_url } from "./global_const.js";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import { Row, Col, Button } from "react-bootstrap";
import ChangeAspectInstellingModal from "./ChangeAspectInstellingModal.jsx"; // Nieuw toegevoegd
import { MdOutlineWbSunny, MdNightsStay } from "react-icons/md";

const Instellingen = ({ username, apikey, darkMode, toggleTheme }) => {
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

  const handleAnnuleer = async () => {
    const data = await getAspectenData(username, apikey);
    setAspectenData(data || []);
  };



  const handleOpslaan = async () => {
    await updateAspectenData(username, apikey);
    const handleClose = () => {};
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAspectenData(username, apikey);
      setAspectenData(data || []);
    };
    fetchData();
  }, [username, apikey]);

  const handleChange = (index, checked) => {
    const newData = [...aspectenData.aspectenLijst];
    newData[index].dagdelenInvullen = checked ? "ja" : "nee";
    setAspectenData({ ...aspectenData, aspectenLijst: newData });
  };

  return (
    <>
      <h1 style={{ fontSize: "x-large" }}>instellingen</h1>
     
      <ul>
        <li style = {{marginBottom: "5px"}}>
          Wijzig darkMode:
          <Button variant="primary" onClick={toggleTheme}>
            {darkMode ? (
              <MdNightsStay size="1.8rem" />
            ) : (
              <MdOutlineWbSunny size={29} />
            )}
          </Button>
        </li>
        <li>
          <ChangeAspectInstellingModal
              username={username}
              apikey={apikey}
          />
        </li>
      </ul>
     {/* 
      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        <Table striped bordered hover>
          <thead style={{ position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 1 }}>
            <tr>
              <th>#</th>
              <th>Aspect</th>
              <th>Alle dagdelen invullen?</th>
            </tr>
          </thead>
          <tbody>
            {aspectenData.aspectenLijst ? (
              aspectenData.aspectenLijst.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.aspect}</td>
                  <td>
                    <Row className="align-items-center">
                      <Col xs="auto">
                        <Form.Check
                          type="checkbox"
                          checked={item.dagdelenInvullen === "ja"}
                          onChange={(e) => handleChange(index, e.target.checked)}
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
 ``
      <Button variant="secondary" onClick={handleAnnuleer}>
        Annuleer
      </Button>


      <Button variant="primary" onClick={handleOpslaan}>
      Opslaan en Sluiten
      </Button>
    */}`
    </>
  );
};

export default Instellingen;
