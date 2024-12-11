import { useState, useEffect, useCallback  } from 'react';

import LoginModal from './loginModal.jsx';
import MyUsers from './myUsers_info.jsx';
import Slider from './Slider.jsx';
import Overzichten from './Overzichten.jsx';
import { Button } from 'react-bootstrap';
import { MdOutlineWbSunny } from "react-icons/md";
import { MdNightsStay } from "react-icons/md";
import mebymeImage from '../mebymeIcon5.png';

// import UploadFile from './uploadFileV1.jsx';

import {BrowserRouter, HashRouter, Navigate, Routes, Route, NavLink} from "react-router-dom";

const MyNavbar = () => { 
    //const path = window.location.pathname
    
    const [username, setUsername] = useState(() => {
        let username = window.localStorage.getItem('username')
        return username ? username : 'guest' // standaard 
    })

    const [apikey, setApikey] = useState(() => {
        let apikey = window.localStorage.getItem('apikey');
        apikey = (apikey === null || apikey === 'null') ? 'no_apikey_saved' : apikey;
        // alert('-' + apikey + '-');
        console.log('26: apikey: ' + apikey)
        return apikey;
    });
    
    // const [sitename, setSitename] = useState(() => {
    //     return username? username : 'astma' // standaard 
    // })

    const [logged_in, setLogged_in] = useState(false)

    const [darkMode, setDarkMode] = useState('light');
   
    const toggleTheme = () => {
      setDarkMode(!darkMode);
      const htmlElement = document.querySelector('html');
      htmlElement.setAttribute('data-bs-theme', 
      darkMode ? 'dark' : 'light');
    };

    // CALBACK 
    const callBackNavBarFromLogin = useCallback((username, newApikey, logged_in_result) => {
        // console.log('31: callBack FromLogin')
        // console.log(username + "  apikey: " + apikey + "  logged_in_result: " + logged_in_result)
        setApikey(newApikey)
        console.log('50: new apikey: ' + newApikey + " old: " + apikey)
        setUsername(username)
        // setSitename(username)
        setLogged_in(logged_in_result)
    },[]);

    const callBack_changeSliderVisibility = useCallback((visibilityChanged) => {
        console.log ('56: callBack_changeSliderVisibility aangeroepen met visibilityChanged = ' + visibilityChanged)
        if (visibilityChanged) {
          // setHasToReloadData(true) 
        }
      },[])

      useEffect (() => {
        toggleTheme() // eeenmalig naar donker standaard

      }, [])


      // END CALLBACK
    return <>

        <HashRouter>
            <div
                style={{
                    display: "flex",
                    
                    background: "rgb(187, 206, 224)",
                    padding: "2px 3px 3px 3px",
                    margin: "3px",
                    fontSize: "19px",
                    boxSizing: "border-box", // Still helpful to include this
                }}
                >

                <img 
                    src={mebymeImage}
                    title="Versie 1.5 agenda"
                    alt="Mebyme"
                    width="45px"
                    height="45px"
                    onClick={() => alert("meByMe Versie 1.5.03 maand kalender overzicht")} // Toon de title bij een klik
                />
               
                <div style={{ margin: "6px" }}>
                    <NavLink
                        to="/mebyme/slider"
                        style={({ isActive }) => ({
                            margin: "5px",
                            padding: "5px",
                            paddingTop: "3px",
                            paddingBottom: "9px",
                            background:  isActive
                                ?"rgb(222, 242, 255)"
                                :"rgb(175, 194, 205)",
                            color: isActive
                                ? "rgb(17, 52, 85)"
                                : "rgb(80, 112, 131)",
                        })}
                    >
                        data
                    </NavLink>
                </div>

                <div style={{ margin: "6px" }}>
                    <NavLink
                        to="/mebyme/overzichten"
                        style={({ isActive }) => ({
                            margin: "5px",
                            padding: "5px",
                            paddingTop: "3px",
                            paddingBottom: "9px",
                            background:  isActive
                                ?"rgb(222, 242, 255)"
                                :"rgb(175, 194, 205)",
                            color: isActive
                                ? "rgb(17, 52, 85)"
                                : "rgb(80, 112, 131)",
                        })}
                    >
                        Rap
                    </NavLink>
                </div>
                <div style={{ margin: "6px" }}>
                    <LoginModal 
                        username={username} 
                        apikey={apikey} 
                        callBackNavBarFromLogin={callBackNavBarFromLogin}
                    />
                </div>
                <div style={{ margin: "6px" }}>
                    <Button variant="primary" onClick={toggleTheme}>    
                        {darkMode ? <MdNightsStay size="1.8rem" /> : <MdOutlineWbSunny size={29}/>}
                    </Button>
                </div>

            </div>
        
            {console.log('148 apikey: ' + apikey)}
            <Routes>
                {/* Redirect from the root path to /mebyme/slider */}
                <Route path="/" element={<Navigate to="/mebyme/slider" replace />} />
                <Route
                path="/mebyme/slider"
        
                element={<Slider username={username} apikey={apikey} logged_in={logged_in} />}
                />
                
                <Route
                path="/mebyme/overzichten"
                element={<Overzichten username={username} apikey={apikey} yearMonth='2024-11' />}
                />
            </Routes>

        </HashRouter>
    </>
}

export default MyNavbar;