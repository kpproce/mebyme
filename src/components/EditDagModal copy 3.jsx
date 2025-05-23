import { React, useState, useEffect, useCallback } from "react";
import { Modal, Table, Button, Tabs, Tab } from "react-bootstrap";
import { basic_API_url } from "./global_const.js";
import Aspect_dagwaarde from "./Aspect_dagwaarde.jsx";
import propTypes from "prop-types";
import { Check, X } from "lucide-react";
import WeerOpDag from './WeerOpDag.jsx';
import "./EditDagModal.css";

const EditDagModal = (props) => {
  const [show, setShow] = useState(false);
  const [dayData, setDayData] = useState([]);
  const [dagOpmerking, setDagOpmerking] = useState('test');
  const [aspectList, setAspectList] = useState([]);
  const imageHomeUrl = basic_API_url() + "php/images/mebyme_icons/";

  const [draggedImageId, setDraggedImageId] = useState(""); // tonen welk aspect je dragt
  const [aspectExtraAanduiding, setAspectExtraAanduiding] = useState("test"); // Als plaatje mist

  const dagModalContainerClass = (dayData.resultData?.slice(0, 5).length || 0) <= 2 
  ? "aspect_dagwaarde_container few-items" 
  : "aspect_dagwaarde_container";

  // dagData opslaan
  async function saveDayData() {
    const postData = new FormData();
    const fetchURL = basic_API_url() + "php/mebyme.php";
    postData.append("username", props.username);
    postData.append("apikey", props.apikey);
    postData.append("datum", props.datum);
    postData.append("dagData", JSON.stringify(dayData.resultData)); // Zet om naar JSON-string
    postData.append("dagOpmerking", dagOpmerking); // Zet om naar JSON-string

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
      setDagOpmerking(data?.opmerkingData?.opmerking ?? "");

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
    console.log("136: Wijzig waarde: van index", index);


    setDayData((prevData) => {
      const updatedData = {
        ...prevData,
        resultData: prevData.resultData.map((item, i) =>
          i === index
            ? {
                ...item,
                last_calc_waarde,
                waardeDagdelen:
                item.aantalDagdelenBijAutoInvullen === 5
                  ? String(last_calc_waarde).repeat(5)
                  : `00${last_calc_waarde}00`,
              }
            : item
        ),
      };
    
      console.log("153 Updated Data:", updatedData);
      return updatedData;
    });
  
    console.log("152: Wijzig last_calc_waarde:", last_calc_waarde, "voor item", index);
    console.log(JSON.stringify(dayData))
    console.log(dayData);
  }, []);

  const calculate_waarde_from_waardeDagdelen_userAspect = async (waardeDagdelen) => {
    const postData = new FormData();
    const fetchURL = basic_API_url() + "php/mebyme.php";

    postData.append("username", props.username);
    postData.append("aspect", props.aspect);
    postData.append("waardeDagdelen", waardeDagdelen);
    postData.append("action", "calculate_waarde_from_waardeDagdelen_userAspect");


    const requestOptions = { method: "POST", body: postData };
    try {
      const res = await fetch(fetchURL, requestOptions);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return (await res.json()).dagWaarde;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  };

  const callBack_handleChangeDagWaardes = useCallback(async (index, dagdeelWaardes) => {
    try {
      const last_calc_waarde = await calculate_waarde_from_waardeDagdelen_userAspect(dagdeelWaardes);
      setDayData(prevData => ({
        ...prevData,
        resultData: prevData.resultData.map((item, i) =>
          i === index
            ? { ...item, last_calc_waarde, waardeDagdelen: dagdeelWaardes }
            : item
        )
      }));
    } catch (error) {
      console.error("Error fetching calculated value:", error);
    }
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
    console.log ('164:', dayData.resultData)
  }, [dayData.resultData]);

  const handleShow = () => setShow(true);
  
  const handleOpslaanEnSluit = () => {
    saveDayData()
    setShow(false);
  };

  const handleAnnuleer = () => setShow(false);

  const handleDragStart = (e, imageName, id) => 
  {  
    console.log(221, "handleDragStart", imageName)
    e.dataTransfer.setData("imageId", id);
    e.dataTransfer.setData("imageName", imageName);
    setDraggedImageId(id);
  };
  
  const handleTouchStart = (e, imageName, id) => {
    e.stopPropagation(); // Voorkom dat de gebeurtenis naar de parent bubbelt
    setDraggedImageId(id);
    e.target.dataset.imageId = id;
    e.target.dataset.imageName = imageName;
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setDraggedImageId("");
    
    const id = e.dataTransfer ? e.dataTransfer.getData("imageId") : e.target.dataset.imageId;
    const imgNaam = e.dataTransfer ? e.dataTransfer.getData("imageName") : e.target.dataset.imageName;
    
    console.log(195, imgNaam);
    
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
            id: 0,
            aspect: id,
            imageLink: imgNaam, 
            last_calc_waarde: "2",
            waardeDagdelen: "22222",
            username: props.username
          }
        ]
      }));
    }
  
    console.log(234, dayData.resultData);
  };
  
  const handleTouchEnd = (e) => {
    e.stopPropagation(); // Voorkom dat de gebeurtenis naar de parent bubbelt
    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
  
    if (target && target.classList.contains("editDagModel_right")) {
      handleDrop({
        preventDefault: () => {},
        dataTransfer: {
          getData: (key) => e.target.dataset[key]
        }
      });
    }
  
    setDraggedImageId("");
  };
  
  const handleDragOver = (e) => {
    e.preventDefault(); // Dit zorgt ervoor dat de drop mogelijk is
  };

  return (
    <> 
      <Button 
        className="transparent-btn"  
        variant={props.dateOutSideMonth ? "primary" : "secondary"}
        onClick={handleShow}
      >
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
          <Modal.Title>
            {props.datum || "N/A"}
            <span className = "weatherInfo">
              <WeerOpDag
                datum = {props.datum}
              />
            </span>
          </Modal.Title>
          
         <span className = "buttonRight">
            <Button  variant="primary" onClick={handleAnnuleer} > <X size={24} color="red" /> </Button>
            <Button  variant="primary" onClick={handleOpslaanEnSluit} > <Check size={24} color="lightgreen" /> </Button>
          </span>

        </Modal.Header>
        <Modal.Body className="noSpaceArround">
          <div className='opmerkingContainer'> 
            <span> Opm </span>
            <textarea className='inputOpmerking' value={dagOpmerking}  onChange={(e) => setDagOpmerking(e.target.value)}></textarea>
          </div>  
          <div className='editDagModal_container'>
           
          {draggedImageId && <div className="drag-overlay">{draggedImageId}</div>}
            <div className='editDagModel_menuLeft'>
              {aspectList.map((item, index) => (
                <div
                  key={index}
                  className="aspect-item"
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, item.best_image, item.aspect)} // Zet de id in de drag event
                  onDragEnd={() => setDraggedImageId("")} // Reset naam bij loslaten
                  onTouchStart={(e) => handleTouchStart(e, item.best_image, item.aspect)}
                  onTouchEnd={handleTouchEnd} 
                >
                  <div className="image-container">
                    <img 
                      src={imageHomeUrl + item.best_image} 
                      id={item.aspect} 
                      style={{ width: "clamp(40px, 11vw, 60px)" }}  
                    />
                    <span className="image-label">{item.aspect.substring(0, 10)}</span>
                  </div>
                </div>

              ))}
            </div>
            <div 
              className='editDagModel_right' 
                onDrop={handleDrop} 
              onDragOver={handleDragOver}
            >
       
              {dayData.resultData?.slice(0, 10).map((item, index) => (
                <div className={dagModalContainerClass} key={index}>
                  <Aspect_dagwaarde
                    index          = {index} // om wijzigingen vanuit child te kunnen bijhouden
                    icon           = {imageHomeUrl + item.imageLink}
                    imageLink      = {imageHomeUrl + item.imageLink}
                    deleteRequest  = {false} // onthoud of de gebruiker deze wil deletend
                    aspect         = {item.aspect}
                    aspect_type    = {item.aspect_type}
                    dagWaarde      = {item.last_calc_waarde}
                    dagdeelWaardes = {item.waardeDagdelen}
                    callBack_handleChangeDagWaarde={callBack_handleChangeDagWaarde}
                    callBack_handleChangeDagWaardes={callBack_handleChangeDagWaardes}
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
  dateOutSideMonth : propTypes.bool,
  callBack_refresh : propTypes.func,
};

export default EditDagModal;
