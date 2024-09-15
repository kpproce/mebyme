import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import GetSliderButton from './GetSliderButton';

// Custom Option Component for react-select
const CustomOption = (props) => {
  console.log ('7: props: ' )
  console.log (props)

  const { data, innerRef, innerProps } = props;
  return (
    <div ref={innerRef} {...innerProps}>
      <GetSliderButton
        icon={data.icon}
        available_icons={data.available_icons}
        size={data.size}
        waarde={data.waarde}
        callBack={data.callBack}
      />
    </div>
  );
};

// Main Component
const DynamicSelectComponent = ({ options, addOption }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    // Pre-select option with value '2' if it exists in the options array
    const defaultOption = options.find(option => option.value === '2');
    setSelectedOption(defaultOption); // Set the default option if it exists
  }, [options]);

  const handleChange = (option) => {
    setSelectedOption(option);
  };

  return (
    <Select
      components={{ Option: CustomOption }}
      value={selectedOption} // The selected option is an object
      onChange={handleChange}
      options={options} // The available options from parent
      placeholder="Select an option"
    />
  );
};

DynamicSelectComponent.propTypes = {
    //callBackWaarde: propTypes.number.isRequired
      
} 

export default DynamicSelectComponent;