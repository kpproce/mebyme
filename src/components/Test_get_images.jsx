import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { basic_API_url } from "./global_const.js";
import Aspect_dagwaarde from "./Aspect_dagwaarde.jsx";

const Test_get_images = ({ aspect, aspect_type }) => {
  const [imagesInfo, setImagesInfo] = useState([]);
  const [dagWaarde, setDagWaarde] = useState(2);
  const [imageUrl, setImageUrl] = useState(""); // Houd de URL van de afbeelding bij

  const callBack_handleChangeDagWaarde = useCallback((nieuweWaarde) => {
    console.log("23: wijzig waarde: " + nieuweWaarde);
    setDagWaarde(nieuweWaarde);
  }, []);

  // Haal de lijst op
  async function getFilenamesOnce() {
    const postData = new FormData();
    const fetchURL = basic_API_url() + "php/mebyme.php";
    postData.append("subfolderName", "./images/mebyme_icons");
    postData.append("sortColumn", "name_sort");
    postData.append("action", "lees_image_namen");

    const requestOptions = {
      method: "POST",
      body: postData,
    };

    try {
      const res = await fetch(fetchURL, requestOptions);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      console.log("36", data); // Log de data voor debugging
      setImagesInfo(data.imagesInfo); // Sla de opgehaalde lijst op
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  useEffect(() => {
    getFilenamesOnce();
  }, []);

  useEffect(() => {
    const get_image_with_Url = () => {
      const imagePath = "http://localhost/mebyme_server/php/images/mebyme_icons/";

      const priorityExtensions = ["png", "jpg", "jfif"];
      const findImage = (baseName) => {
        for (const ext of priorityExtensions) {
          const filename = `${baseName}.${ext}`;
          const foundImage = imagesInfo.find((image) => image.filename === filename);
          if (foundImage) {
            return foundImage.filename;
          }
        }
        return null;
      };

      let imagename = findImage(aspect);
      if (!imagename) {
        imagename = findImage(aspect_type);
      }
      if (!imagename) {
        imagename = `${aspect_type}.png`;
      }
      console.log("70: gevonden: ", imagename);
      return imagePath + imagename;
    };

    // Bijwerken van de URL wanneer `aspect` verandert
    setImageUrl(get_image_with_Url());
  }, [aspect, aspect_type, imagesInfo]); // Luister naar wijzigingen in `aspect`, `aspect_type` en `imagesInfo`

  return (
    <>
  
      <Aspect_dagwaarde
        icon={imageUrl} // Gebruik de dynamisch bijgewerkte image URL
        aspect={aspect}
        aspect_type={aspect_type}
        titel={aspect}
        dagWaarde={dagWaarde}
        callBack_handleChangeDagWaarde={callBack_handleChangeDagWaarde}
      />
    </>
  );
};

Test_get_images.propTypes = {
  dagWaarde   : PropTypes.number,
  aspect      : PropTypes.string.isRequired,
  aspect_type : PropTypes.string.isRequired,
};

export default Test_get_images;
