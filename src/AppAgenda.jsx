import MyNavbar from "./components/navbar.jsx";
import React from 'react';
import Agenda from './components/Agenda.jsx';

function App() {
  const month = "2024-09";
  const username = 'guest';
  const apikey = '4a01b748a716b027b43514fc86670db4';

  return (
    <div>
      <h1>My Data Chart</h1>
      <Agenda
        username={username}
        apikey={apikey}
        month={month}
      />
    </div>
  )

}
export default App