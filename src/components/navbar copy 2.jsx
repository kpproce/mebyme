import { useState, useEffect, useCallback } from 'react';
import { version } from "./version.js";
import LoginModal from './loginModal.jsx';
import MyUsers from './myUsers_info.jsx';
import Slider from './Slider.jsx';
import Overzichten from './Overzichten.jsx';
import { Button } from 'react-bootstrap';
import { MdOutlineWbSunny } from "react-icons/md";
import { MdNightsStay } from "react-icons/md";
import mebymeImage from '../mebymeIcon5.png';
import { HashRouter, Navigate, Routes, Route, NavLink, useNavigate } from "react-router-dom";

const MyNavbar = () => {
    const [username, setUsername] = useState(() => {
        const username = window.localStorage.getItem('username');
        return username ? username : 'guest';
    });

    const [apikey, setApikey] = useState(() => {
        let apikey = window.localStorage.getItem('apikey');
        return apikey && apikey !== 'null' ? apikey : 'no_apikey_saved';
    });

    const [activeMenu, setActiveMenu] = useState('Rap');
    const [logged_in, setLogged_in] = useState(false);
    const [darkMode, setDarkMode] = useState('light');

    const navigate = useNavigate();

    // Synchroniseer activeMenu met navigatie
    useEffect(() => {
        if (activeMenu === 'data') {
            navigate('/mebyme/slider');
        } else if (activeMenu === 'Rap') {
            navigate('/mebyme/overzichten');
        }
    }, [activeMenu, navigate]);

    const toggleTheme = () => {
        setDarkMode(!darkMode);
        const htmlElement = document.querySelector('html');
        htmlElement.setAttribute('data-bs-theme', darkMode ? 'dark' : 'light');
    };

    const callBackNavBarFromLogin = useCallback((username, newApikey, logged_in_result) => {
        setApikey(newApikey);
        setUsername(username);
        setLogged_in(logged_in_result);
    }, []);

    return (
        <>
            <HashRouter>
                <div
                    style={{
                        display: "flex",
                        background: "rgb(187, 206, 224)",
                        padding: "2px 3px 3px 3px",
                        margin: "3px",
                        fontSize: "19px",
                        boxSizing: "border-box",
                    }}
                >
                    <img 
                        src={mebymeImage}
                        title="Versie 1.5 agenda"
                        alt="Mebyme"
                        width="45px"
                        height="45px"
                        onClick={() => alert(version)} 
                    />
                    <div style={{ margin: "6px" }}>
                        <NavLink
                            to="/mebyme/slider"
                            onClick={() => setActiveMenu('data')}
                            style={({ isActive }) => ({
                                margin: "5px",
                                padding: "5px",
                                paddingTop: "3px",
                                paddingBottom: "9px",
                                background: isActive ? "rgb(222, 242, 255)" : "rgb(175, 194, 205)",
                                color: isActive ? "rgb(17, 52, 85)" : "rgb(80, 112, 131)",
                            })}
                        >
                            data
                        </NavLink>
                    </div>
                    <div style={{ margin: "6px" }}>
                        <NavLink
                            to="/mebyme/overzichten"
                            onClick={() => setActiveMenu('Rap')}
                            style={({ isActive }) => ({
                                margin: "5px",
                                padding: "5px",
                                paddingTop: "3px",
                                paddingBottom: "9px",
                                background: isActive ? "rgb(222, 242, 255)" : "rgb(175, 194, 205)",
                                color: isActive ? "rgb(17, 52, 85)" : "rgb(80, 112, 131)",
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
                    {activeMenu}
                </div>

                <Routes>
                    {/* Redirect from the root path to /mebyme/slider */}
                    <Route path="/" element={<Navigate to="/mebyme/slider" replace />} />
                    <Route
                        path="/mebyme/slider"
                        element={<Slider username={username} apikey={apikey} logged_in={logged_in} />}
                    />
                    <Route
                        path="/mebyme/overzichten"
                        element={<Overzichten 
                            setActiveMenu={setActiveMenu} 
                            username={username} 
                            apikey={apikey} 
                            yearMonth="2025-01"
                        />}
                    />
                </Routes>

            </HashRouter>
        </>
    );
}

export default MyNavbar;