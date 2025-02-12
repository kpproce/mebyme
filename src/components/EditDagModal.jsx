// versie 5 werkend sleep met bestaat al.
import { React, useState, useEffect, useCallback } from "react";
import { Modal, Table, Button, Tabs, Tab } from "react-bootstrap";
import { basic_API_url } from "./global_const.js";
import Aspect_dagwaarde from "./Aspect_dagwaarde.jsx";
import propTypes from "prop-types";
import { Check, X } from "lucide-react";
import "./EditDagModal.css";

const EditDagModal = (props) => {
  const [show, setShow] = useState(false);
  const [dayData, setDayData] = useState([]);
  const [aspectList, setAspectList] = useState([]);
  const imageHomeUrl = basic_API_url() + "php/images/mebyme_icons/";

  // dagData opslaan
  async function saveDayData() {
    const postData = new FormData();
    const fetchURL = basic_API_url() + "php/mebyme.php";
    postData.append("username", props.username);
    postData.append("apikey", props.apikey);
    postData.append("datum", props.datum);
    postData.append("dagData", JSON.stringify(dayData.resultData)); // Zet om naar JSON-string
    postData.append("action", "update_or_create_hgh_waarneming_dag");

    const requestOptions = {
      method: "POST",
      body: postData,
    };

    try {
      const res = await fetch(fetchURL, requestOptions);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();

      props.callBack_refresh() // refresh de parent

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

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
      // Voeg deleteRequest toe
      const enrichedData = data.resultData.map(item => ({
        ...item,
        deleteRequest: false
      }));

      setDayData({ ...data, resultData: enrichedData });

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  // Zichtbare aspecten ophalen, voor user om nieuwe waarde te kunnen invoeren 
  async function get_aspectList() {
    const postData = new FormData();
    const fetchURL = basic_API_url() + "php/mebyme.php";
    postData.append("username", props.username);
    postData.append("apikey", props.apikey);
    postData.append("action", "get_visibleAspects_user");

    const requestOptions = {
      method: "POST",
      body: postData,
    };

    try {
      const res = await fetch(fetchURL, requestOptions);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      setAspectList(data.aspectList)
      console.log(data)

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  useEffect(() => {
    // console.log("Modal is open:", show); // Log de status van de modal
    if (show) {
      // console.log("Modal is open, disabling scroll");
      getDayData();
      get_aspectList();
      document.body.style.overflow = 'hidden'; // Voorkomt scrollen op de achtergrond
    } else {
      // console.log("Modal is closed, enabling scroll");
      document.body.style.overflow = 'auto'; // Zet scrollen weer aan wanneer de modal gesloten is
    }
    return () => {
     //  console.log("Cleanup: enabling scroll");
      document.body.style.overflow = 'auto';
    };
  }, [show]);

  useEffect(() => {
    console.log("Updated dayData wijziging gedetecteerd:", dayData.resultData);
  }, [dayData]);

  const callBack_handleChangeDagWaarde = useCallback((index, last_calc_waarde) => {
    console.log("53: Wijzig waarde: van index", index);
  
    setDayData((prevData) => ({
      ...prevData,
      resultData: prevData.resultData.map((item, i) =>
        i === index 
          ? { 
              ...item, 
              last_calc_waarde, 
              waardeDagdelen: String(last_calc_waarde).repeat(5) // Vijf keer het getal als string
            } 
          : item
      ),
    }));
  
    console.log("Wijzig last_calc_waarde:", last_calc_waarde, "voor item", index);
  }, []);

  const callBack_handleDeleteRequest = useCallback((index, deleteRequest) => {
    console.log("Wijzig waarde: van index", index);
    setDayData((prevData) => ({
      ...prevData,
      resultData: prevData.resultData.map((item, i) =>
        i === index ? { ...item, deleteRequest } : item
      ),
    }), dayData.resultData);
    console.log("Wijzig delete request:", deleteRequest, "voor item", index);
    console.log ('63:', dayData.resultData)
  }, [dayData.resultData]);

  const handleShow = () => setShow(true);
  
  const handleOpslaanEnSluit = () => {
    saveDayData()
    setShow(false);
  };

  const handleAnnuleer = () => setShow(false);

  const handleDragStart = (e, imageName, id) => {
    // Hier kunnen we alleen de id zetten voor het slepen, geen alert
    e.dataTransfer.setData("imageId", id);
    e.dataTransfer.setData("imageName", imageName); // Hier slaan we de afbeeldingsnaam op
  };


  const handleDrop = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("imageId");
    const imgNaam = e.dataTransfer.getData("imageName");
    console.log(170, imgNaam); // Dit bevat de naam van de afbeelding met extensie, zonder pad
  
    const exists = dayData.resultData.some(item => item.aspect === id);
  
    if (exists) {
      const draggedElement = document.getElementById(id);
      if (draggedElement) {
        draggedElement.classList.add("return-to-origin");
        setTimeout(() => {
          draggedElement.classList.remove("return-to-origin");
          draggedElement.classList.add("highlight-error");
  
          setTimeout(() => {
            draggedElement.classList.replace("highlight-error", "fade-out");
  
            setTimeout(() => {
              draggedElement.classList.remove("fade-out");
            }, 2000);
          }, 2000);
        }, 2000);
      }
    } else {
      setDayData(prevData => ({
        ...prevData,
        resultData: [
          ...prevData.resultData,
          {
            ...prevData.resultData[0],
            id: 0, // id van de waarneming is 0, ofwel er is geen id, de backend maakt dan een nieuwe waarneming en id.
            aspect: id, // id is id van e image en dat is de naam van het aspect...
            imageLink: imgNaam, 
            last_calc_waarde: "2",
            waardeDagdelen: "22222"

          }
        ]
      }));
    }
  };
  

  const handleDragOver = (e) => {
    e.preventDefault(); // Dit zorgt ervoor dat de drop mogelijk is
  };

  return (
    <> 
      <Button className="transparent-btn" variant="primary" onClick={handleShow}>
        {new Date(props.datum).getDate()}
      </Button>
      <Modal
        contentClassName="modalBody"
        show={show}
        onHide={handleOpslaanEnSluit}
        centered
        backdrop={false}
      >
        <Modal.Header className="d-flex justify-content-between">
          <Modal.Title>{props.datum || "N/A"}</Modal.Title>
         <span className = "buttonRight">
            <Button  variant="primary" onClick={handleAnnuleer} > <X size={24} color="red" /> </Button>
            <Button  variant="primary" onClick={handleOpslaanEnSluit} > <Check size={24} color="lightgreen" /> </Button>
          </span>
        
          <Button variant="primary" onClick={handleAnnuleer}>
            X
          </Button>
        </Modal.Header>
        <Modal.Body className="noSpaceArround">
          <div className='editDagModal_container'>
            <div className='editDagModel_menuLeft'>
              {aspectList.map((item, index) => (
                <div
                  key={index}
                  className="aspect-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.best_image, item.aspect)} // Zet de id in de drag event
                >
                  <img src={imageHomeUrl + item.best_image} id={item.aspect} style={{ width: "30px", height: "30px" }} />
                </div>
              ))}
            </div>
            <div 
              className='editDagModel_right' 
              onDrop={handleDrop} 
              onDragOver={handleDragOver}
            >
              {dayData.resultData?.slice(0, 5).map((item, index) => (
                <div className="aspect_dagwaarde_container">
                  <Aspect_dagwaarde
                    index={index} // om wijzigingen vanuit child te kunnen bijhouden
                    icon={imageHomeUrl + item.imageLink}
                    imageLink={imageHomeUrl + item.imageLink}
                    deleteRequest={false} // onthoud of de gebruiker deze wil deletend
                    aspect={item.aspect}
                    aspect_type={item.aspect_type}
                    dagWaarde={item.last_calc_waarde}
                    callBack_handleChangeDagWaarde={callBack_handleChangeDagWaarde}
                    callBack_handleDeleteRequest={callBack_handleDeleteRequest}
                  />
                </div>
              ))}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleAnnuleer}>
            Annuleer (<X size={24} color="red" />)
          </Button>
          <Button variant="primary" onClick={handleOpslaanEnSluit}>
            Opslaan (<Check size={24} color="lightgreen" />)
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

EditDagModal.propTypes = {
  username         : propTypes.string,
  apikey           : propTypes.string,
  datum            : propTypes.string,
  callBack_refresh : propTypes.func,
};

export default EditDagModal;
