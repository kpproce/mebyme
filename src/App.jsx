import React from 'react';
import { version } from './components/version';

const App = () => {
    return (
        <div>
            <h1>Welkom bij meByMe</h1>
            <p>Versie: {version}</p>
            {/* Andere componenten en inhoud */}
        </div>
    );
};

export default App;