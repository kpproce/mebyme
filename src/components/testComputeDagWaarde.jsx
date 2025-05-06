import {React, useEffect, useState} from "react";
import computeDagwaarde from "../hooks/computeDagwaarde";

import './testComputeDagWaarde.css';

const TestComputeDagWaarde = () => {
  const dagdeelWaardes = 
  ['14311', '15411']
  /* ,'13222', '00234', '00134', '00124', '00034', '15311', '23135', '04304',
    '00014', '00024', '00024', '00034', '00015', '00025', '00035', '03435',
    '02002', '02030', '01355', '01455', '03030', '03131', '00035', '00045',
    '11555', '11155', '11255', '11144', '11244', '00134', '00234', '00034'
  ]; 
 */
  const [dagData, setDagData] = useState([]);

  // Gebruik useEffect om de berekeningen uit te voeren en op te slaan
  useEffect(() => {
     const berekendeDagdeelWaarden = dagdeelWaardes.map((waarde) => {
    
      const gemLaagFilter     = computeDagwaarde(waarde, "gem", 90,  [0,1,1,0,0]);
      const gemBasisFilter    = computeDagwaarde(waarde, "gem", 100, [0,1,1,0,0]);
      const gemHoogFilter     = computeDagwaarde(waarde, "gem", 110, [0,1,1,0,0]);

      const gemLaag           = computeDagwaarde(waarde, "gem", 90 );
      const gemBasis          = computeDagwaarde(waarde, "gem", 100)
      const gemHoog           = computeDagwaarde(waarde, "gem", 110)

      const somLaag           = computeDagwaarde(waarde, "som", 90);
      const somBasis          = computeDagwaarde(waarde, "som", 100);
      const somHoog           = computeDagwaarde(waarde, "som", 110);
  
      return {
        waardeDagdelen: gemLaag.waardeDagdelen,
        waardeDagdelenGefilterd: gemLaagFilter.waardeDagdelenMetFilter,
        
        dagwaardeLaagGefilterd:  gemLaagFilter.dagwaarde,
        dagwaardeBasisGefilterd: gemBasisFilter.dagwaarde,
        dagwaardeHoogGefilterd:  gemHoogFilter.dagwaarde,
    
        dagwaardeLaag:  gemLaag.dagwaarde,
        dagwaardeBasis: gemBasis.dagwaarde,
        dagwaardeHoog:  gemHoog.dagwaarde,
    
      };
    });
    setDagData(berekendeDagdeelWaarden);

    console.log('36: dagData:', berekendeDagdeelWaarden);
  
  }, []); // Lege dependency array, zodat dit alleen bij de eerste render wordt uitgevoerd



  return (
    <> 
      <h2>testComputeDagWaarde</h2>
      
      <table>
        <tbody>
          <tr>
            <th>WaardeDagdelen</th>
            <th>gefilterd</th>
            <th>gem 90 filter</th>
            <th>gem 100 filter</th>
            <th>gem 110 filter</th>
            <th>gem 90 </th>
            <th>gem 100 </th>
            <th>gem 110</th>


          </tr>

          {dagData.map((gegevens, index) => (
            
            <tr key={index}>
              <td> {gegevens.waardeDagdelen} </td>
              <td> {gegevens.waardeDagdelenGefilterd} </td>

              <td> {gegevens.dagwaardeLaagGefilterd} </td>
              <td> {gegevens.dagwaardeBasisGefilterd} </td>
              <td> {gegevens.dagwaardeHoogGefilterd} </td>

              <td> {gegevens.dagwaardeLaag} </td>
              <td> {gegevens.dagwaardeBasis} </td>
              <td> {gegevens.dagwaardeHoog} </td>

            </tr>
          ))}
        </tbody>
      </table>
     
    </>
  );
};

export default TestComputeDagWaarde;
