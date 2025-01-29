import { React, useState, useEffect, useCallback } from "react";
import { Modal, Table, Button, Tabs, Tab } from "react-bootstrap";
import { basic_API_url } from "./global_const.js";
import Aspect_dagwaarde from "./Aspect_dagwaarde.jsx";
import propTypes from "prop-types";
import "./EditDagModal.css";

const EditDagModal = (props) => {
  const [show, setShow] = useState(false);
  const [dayData, setDayData] = useState([]);
  const imageHomeUrl = basic_API_url() + "php/images/mebyme_icons/";

  // Data ophalen
  async function getDayData() {
    const postData = new FormData();
    const fetchURL = basic_API_url() + "php/mebyme.php";
    postData.append("username", props.username);
    postData.append("apikey", props.apikey);
    postData.append("datum", props.datum);
    postData.append("action", "get_hgh_data_1_day");

    const requestOptions = {
      method: "POST",
      body: postData,
    };

    try {
      const res = await fetch(fetchURL, requestOptions);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      setDayData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  useEffect(() => {
    if (show) getDayData();
  }, [show]);

  const callBack_handleChangeDagWaarde = useCallback((nieuweWaarde) => {
    console.log("Wijzig waarde:", nieuweWaarde);
  }, []);

  const handleShow = () => setShow(true);
  const handleClose = () => {
    props.callBack_set_hgh_details();
    setShow(false);
  };
  const handleAnnuleer = () => setShow(false);

  const renderEditTableVersie = () => (
    <Table responsive bordered>
      <thead>
        <tr>
          <th>Aspect</th>
          <th>Aspect Type</th>
          <th>Last Calc Waarde</th>
          <th>Opmerking</th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(dayData.resultData) &&
          dayData.resultData.slice(0, 5).map((item, index) => (
            <tr key={index}>
              <td>{item.aspect || "N/A"}</td>
              <td>{item.aspect_type || "N/A"}</td>
              <td>{item.last_calc_waarde || "N/A"}</td>
              <td>{item.opmerking || "N/A"}</td>
            </tr>
          ))}
      </tbody>
    </Table>
  );

  const renderIconEditVersie = () => (
    <Table responsive bordered>
      <thead>
      </thead>
      <tbody>
        {Array.isArray(dayData.resultData) &&
          dayData.resultData.slice(0, 5).map((item, index) => (
            <tr key={index}>
              <td>
                <Aspect_dagwaarde
                  icon        = {imageHomeUrl +item.imageLink}
                  imageLink   = {imageHomeUrl +item.imageLink}
                  aspect      = {item.aspect}
                  aspect_type = {item.aspect_type}
                  dagWaarde   = {item.last_calc_waarde}
                  callBack_handleChangeDagWaarde={callBack_handleChangeDagWaarde}
                />
              </td>
            </tr>
          ))}
      </tbody>
    </Table>
  );

  return (
    <>
      <Button className="transparent-btn" variant="primary" onClick={handleShow}>
        {new Date(props.datum).getDate()}
      </Button>
      <Modal
        contentClassName="modalBody"
        show={show}
        onHide={handleClose}
        centered
        backdrop={false}
      >
        <Modal.Header>
          <Modal.Title>{props.datum || "N/A"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="tab1" id="edit-dag-modal-tabs" className="mb-3">
            <Tab eventKey="tab1" title="tab1">
              {renderIconEditVersie()}
            </Tab>
            <Tab eventKey="tab2" title="tab2">
              {renderEditTableVersie()}
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleAnnuleer}>
            Annuleer
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Opslaan en Sluiten
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

EditDagModal.propTypes = {
  username: propTypes.string,
  apikey: propTypes.string,
  datum: propTypes.string,
  callBack_set_hgh_details: propTypes.func,
};

export default EditDagModal;
