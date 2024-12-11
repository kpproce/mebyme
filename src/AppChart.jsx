import MyNavbar from "./components/navbar.jsx";
import React from 'react';
import GraphMyData from './components/GraphMyData.jsx';

function App() {
  const startDate = '2024-09-01';
  const endDate = '2024-10-15';
  const username = 'guest';
  const apikey = '4a01b748a716b027b43514fc86670db4';

  return (
    <div>
      <h1>My Data Chart</h1>
      <GraphMyData
        startDate={startDate}
        endDate={endDate}
        username={username}
        apikey={apikey}
      />
    </div>
  )

}
export default App