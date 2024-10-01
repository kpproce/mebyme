import React, { useState } from 'react';
import DynamicSelectComponent from './DynamicSelectComponent';

const Test_dynamicSelect = () => {
  const [options, setOptions] = useState([
    {
      value: '1',
      label: 'Option 1',
      icon: 'icon1.png',
      available_icons: ['icon1.png', 'icon2.png'],
      size: 'large',
      waarde: 'Value 1',
      callBack: (value) => console.log('Option clicked:', value)
    },
    {
      value: '2',
      label: 'Option 2',
      icon: 'icon2.png',
      available_icons: ['icon2.png'],
      size: 'small',
      waarde: 'Value 2',
      callBack: (value) => console.log('Option clicked:', value)
    },
    // Add more options as needed
  ]);

  const addOption = (label, value) => {
    setOptions((prevOptions) => [
      ...prevOptions,
      {
        value,
        label,
        icon: 'default_icon.png',
        available_icons: ['default_icon.png'],
        size: 'small',
        waarde: label,
        callBack: (value) => console.log('Option added:', value)
      }
    ]);
  };

  return (
    <div>
      <h2>Dynamic Select Example</h2>
      <DynamicSelectComponent options={options} addOption={addOption} />
      <div style={{ marginTop: '10px' }}>
        <button onClick={() => addOption('Strawberry', 'strawberry')}>
          Add Strawberry
        </button>
        <button onClick={() => addOption('Vanilla', 'vanilla')}>
          Add Vanilla
        </button>
      </div>
    </div>
  );
};

export default Test_dynamicSelect;