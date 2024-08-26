import {useState, useEffect, useCallback  } from 'react'

// import Table_test_mapping from './Table_test_mapping.jsx'

const test_mapping_chatgpt = () => { 
 
  const [dataCol1, setDataCol1] = useState ();  
  const [sliderData, setSliderData] = useState([])
 
  const data = [
    { id: 'id1', className: 'class1', dataValue: 'data1', content: 'Content 1' },
    { id: 'id2', className: 'class2', dataValue: 'data2', content: 'Content 2' },
    { id: 'id3', className: 'class3', dataValue: 'data3', content: 'Content 3' }
  ];


  

  // setDataCol1 (data[0])


  return (
    <div>
      <h1>Table with Attributes</h1>
      {/* <Table_test_mapping data={data} /> */}

      <p> {JSON.stringify(Object.keys(data[0]))} </p>

    </div>

  );
};

export default test_mapping_chatgpt;

test_mapping_chatgpt.propTypes = {
  // value: propTypes.string.isRequired,
  // callBack_myUsers_from_editRole: propTypes.func.isRequired
}

