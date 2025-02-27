// toont de 5 dagdelen in de volledige breedte van de parent.
// in dagdelenString bijv: "02410"
import React, { useState, useEffect } from "react";
import propTypes from 'prop-types'; // ES6

const DagdelenEdit = ({ dagdeelWaardes }) => {
  
 useEffect(() => {
    console.log("dagdeelWaardes aangepast: " + "-" + dagdeelWaardes + "-")
  }, [dagdeelWaardes]);

  return (
    dagdeelWaardes ? (
      <table className="dagdelenEdit_tabelStyle">
        <tr>
          <th>N</th><th>O</th><th>M</th><th>M</th><th>N</th>
        </tr>
        <tr>
          <td>{dagdeelWaardes[0]}</td>
          <td>{dagdeelWaardes[1]}</td>
          <td>{dagdeelWaardes[2]}</td>
          <td>{dagdeelWaardes[3]}</td>
          <td>{dagdeelWaardes[4]}</td>
        </tr>
      </table>
    ) : "fout in dagdelenString "+ dagdelenstring
  );
}

DagdelenEdit.propTypes = {
    //callBackWaarde: propTypes.number.isRequired
    dagdeelWaardes    : propTypes.string, 
  }

export default DagdelenEdit;
