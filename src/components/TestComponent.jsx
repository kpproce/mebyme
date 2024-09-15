import Select from 'react-select'; // Ensure you have the correct import for Select

import './TestComponent.css'

const TestComponent = () => {
  return (
    <div className = 'div-TestComponent'>
         <h1>Test Select Component Styling</h1>
      <Select
        classNamePrefix="custom-select" // Use this to prefix classes in the select component
        options={[
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' }
        ]}
        placeholder="Select an option"
      />
    </div>
  );
};

export default TestComponent;