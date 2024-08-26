import React from 'react';
import PropTypes from 'prop-types';

const Table_test_mapping = ({ data }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Class Name</th>
          <th>Data Value</th>
        </tr>
      </thead>
      <tbody>
        <tr >
        {data.map((item, index) => (
       
            <td key={item.id} id={item.id} className={item.className} data-value={item.dataValue}>
              {item.content}
            </td>
          
        ))}
        </tr>
      </tbody>
    </table>
  );
};

export default Table_test_mapping;

Table_test_mapping.propTypes = {
  data: PropTypes.string.isRequired,
  // callBack_myUsers_from_editRole: propTypes.func.isRequired
}

