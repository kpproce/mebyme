import {React, useState, useEffect, useCallback  } from 'react';
import PropTypes from 'prop-types'
import Table from 'react-bootstrap/Table';
import {getLastDateOfDutchWeek} from './utils.js'
// import {maandNamenKort} from './utils.js'
import {maandNamenKort} from './global_const.js'
import { v4 as uuidv4 } from 'uuid';

// import DeleteUser from './deleteUser.jsx';
// import EditUser from './editUser.jsx';
// import EditRole from './editRole.jsx';


const SliderMonthsColored = (props) => { 

  // console.log('15: SliderMonthsColored aangeroepen')

  var selectOptions = [];
  for (let i = 0; i < 6; i++) {
      selectOptions[i] = i;
  } 

  const [isHovered, setIsHovered] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [isMobile, setIsMobile] = useState(false); // State to track mobile status

  // Check if the device is mobile
  const checkIfMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      if (/android|iphone|ipad|ipod/i.test(userAgent)) {
          setIsMobile(true);
      } else {
          setIsMobile(false);
      }
  };

  
  const getMonthNameFromWeek = (weekStr) => { // input like '2024_12'
    const [year, week] = weekStr.split(/[-_]/).map(Number); // Extract year and week number
    const date = new Date(year, 0, (week - 1) * 7 + 1); // Calculate date based on week number
    return date.toLocaleString('default', { month: 'short' }); // Return month name (short format)
  };


  const create_montNameRow_fromWeeknumbers = () =>  {

    const monthsRow = []
    
    console.log('108:')
    console.log(props)
    let currentMonth = getMonthNameFromWeek(props.metaWeek[0].yearWeek);
    console.log('currentMonth: ' + currentMonth)
    console.log('112:')
    let monthCountItem = {
      'monthName' : currentMonth, 
      'count'     : 0
    }
    console.log('117:')
    props.metaWeek.forEach((week, index) => {
      if (getMonthNameFromWeek(week.yearWeek) == currentMonth) {
        monthCountItem.count += 1;
      } else { // verandering maand 
        monthsRow.push( Object.assign({}, monthCountItem))
        // reset monthCountItem
        currentMonth =  getMonthNameFromWeek(week.yearWeek) 
        monthCountItem.monthName = currentMonth
        monthCountItem.count = 1
      }
    });
    monthsRow.push(Object.assign({}, monthCountItem))

    console.log('131:')
    console.log(monthsRow)
    return monthsRow
  }
  
  const handleMouseEnter = (wekenData, e) => {  // tooltip
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipStyle({
        top: rect.bottom + window.scrollY + 5, // Position the tooltip below the cell
        left: rect.left + window.scrollX, // Align with the cell
    });
    setTooltipContent(wekenData.jaar + " week: " + wekenData.week ); // Set the tooltip content
    setIsHovered(true); // Show tooltip
};

const handleMouseLeave = () => {
    setIsHovered(false); // Hide tooltip
};


  return (
  <div>
    <h3>Weekdata voor {props.aspect}</h3>
  
      <Table>
      {/*   <tr>          
          <th>week</th>            
          <th>vanaf</th>            
          <th>gem</th>            
          <th>max</th>  
        </tr> */}
        <tbody>      
          <tr>           
            {  create_montNameRow_fromWeeknumbers().map((item, index) => (
              <td key={"weekdat" + index} className='tdBorder' colSpan={item.count}>
                {item.count>1?item.monthName:""}
              </td>
            ))}
          </tr>   
          <tr key={"12345"}>      
            { props.metaWeek.map((wekenData, index) => (
                  wekenData.data.length>0?
                    <td 
                      key={ index + "weekDataMaxWaarde"} 
                      className={"color_" + wekenData.data[0].maxWaarde + " tdBorder" }
                      //onClick={() => alert(wekenData.yearWeek + ": " + getLastDateOfDutchWeek(wekenData.yearWeek))}
                      onClick={() => props.callBack_changePeriod(getLastDateOfDutchWeek(wekenData.yearWeek))}
                      onMouseEnter={(e) => handleMouseEnter(wekenData, e)} // Show tooltip on hover
                      onMouseLeave={handleMouseLeave} // Hide tooltip on mouse leave
                    > 
                      {wekenData.data[0].maxWaarde} 
                    </td>
                    
                  : <td key={ index + "weekDataMaxWaarde"} className='color_0 tdBorder'> 
                      - 
                    </td>
                  
            ))}
          </tr>   
          {isHovered && (
                      <div style={{
                          position: 'absolute',
                          top: tooltipStyle.top,
                          left: tooltipStyle.left,
                          backgroundColor: '#333',
                          color: '#fff',
                          padding: '5px 10px',
                          borderRadius: '5px',
                          zIndex: 100,
                          whiteSpace: 'nowrap',
                          opacity: 0.8,
                      }}>
                          {tooltipContent}
                      </div>
                  )}
        </tbody>
      </Table>
  </div>
    )
}

SliderMonthsColored.propTypes = {
  metaWeek: PropTypes.array.isRequired,
  aspect: PropTypes.string.isRequired,
  callBack_changePeriod: PropTypes.func.isRequired
}

  

export default SliderMonthsColored;