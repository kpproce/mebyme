import {React, useState, useEffect, useRef, useCallback  } from 'react';
import PropTypes from 'prop-types'
import Table from 'react-bootstrap/Table';
import {getLastDateOfDutchWeek} from './utils.js'
import SliderMonthsSettings from './SliderMonthsSettings.jsx'
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
  const timeoutRef = useRef(null); // Ref to store the timeout ID to remove it after x seconds
 
  const [useMaxOrGem, setUseMaxOrGem] = useState('gem');
  

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

  // Call checkIfMobile on component mount
  useEffect(() => {
      setIsMobile(checkIfMobile());
  }, []);

  const getMonthNameFromWeek = (weekStr) => { // input like '2024_12'
    const [year, week] = weekStr.split(/[-_]/).map(Number); // Extract year and week number
    const date = new Date(year, 0, (week - 1) * 7 + 1); // Calculate date based on week number
    return date.toLocaleString('default', { month: 'short' }); // Return month name (short format)
  };

  const create_montNameRow_fromWeeknumbers = () =>  {
    const monthsRow = []
    let currentMonth = getMonthNameFromWeek(props.metaWeek[0].yearWeek);
    let monthCountItem = {
      'monthName' : currentMonth, 
      'count'     : 0
    }

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

    return monthsRow
  }
    
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('nl-NL', { day: 'numeric', month: 'short' });
  };
    
  const handleMouseEnter = (wekenData, e) => {  // tooltip
    if (!e.currentTarget) return; // Ensure currentTarget is available
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipWidth = 150; // Set a static width for the tooltip
    let left = rect.left + window.scrollX; // Align with the cell
    let top = rect.bottom + window.scrollY-2; // Position below the cell

    // Check if tooltip goes off the right side of the screen
    if (left + tooltipWidth > window.innerWidth) {
        left = window.innerWidth - tooltipWidth - 10; // Adjust left position to fit within the viewport
    }

    setTooltipStyle({ top, left });
    setTooltipContent("week " + wekenData.week + " " + " t/m " + formatDate(getLastDateOfDutchWeek(wekenData.yearWeek))); // Set tooltip content
    setIsHovered(true); // Show tooltip
};

const callBack_from_settings = (waarde) => {
  setUseMaxOrGem(waarde)
}


const clearTimeoutIfExists = () => {
  if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null; // Reset the timeout ID
  }
};

const handleMouseLeave = () => {
  clearTimeoutIfExists(); // Cancel any existing timeout
  setIsHovered(false);
};

const handleTouchEnd = () => {
  setIsHovered(false);
};

const handleTap = (wekenData, e) => {
  e.preventDefault(); // Prevent default touch behavior
  if (!e.currentTarget) return; // Ensure currentTarget is available
  const rect = e.currentTarget.getBoundingClientRect();
  const tooltipWidth = 150; // Set a static width for the tooltip
  let left = rect.left + window.scrollX; // Align with the cell
  let top = rect.bottom + window.scrollY + 5; // Position below the cell

  // Check if tooltip goes off the right side of the screen
  if (left + tooltipWidth > window.innerWidth) {
      left = window.innerWidth - tooltipWidth - 10; // Adjust left position to fit within the viewport
  }

  setTooltipStyle({ top, left });
  setTooltipContent(wekenData.week); // Set tooltip content
  setIsHovered(true); // Show tooltip
};

  return (
    <div className='fitIn'>
      <Table striped bordered hover size="sm">
        <tbody>      
          <tr>           
            <td key='sliderMonthsSettingCell_0'></td>
            {  create_montNameRow_fromWeeknumbers().map((item, index) => (
              <td key={"weekdat" + index} className='tdBorder' colSpan={item.count}>
                {item.count>1?item.monthName:""}
              </td>
            ))}
          </tr>   
          <tr key={"sliderMonthsDataRow"}>  
            <td key='sliderMontsSettingCell_1'>
                <SliderMonthsSettings
                  useMaxOrGem = {useMaxOrGem}
                  callBack_from_settings = {callBack_from_settings}
                />
            </td>    
            { props.metaWeek.map((wekenData, index) => (
                  wekenData.data.length>0?
                    <> 
                    <td 
                      key={ index + "weekDataMaxWaarde"} 
                      //className={"color_" + Math.round(wekenData.data[0].maxWaarde) + " tdBorder" }
                      className={"color_" + Math.round(useMaxOrGem === 'max' ? wekenData.data[0].maxWaarde : wekenData.data[0].gemWaarde) + " tdBorder" }
                      //onClick={() => alert(wekenData.yearWeek + ": " + getLastDateOfDutchWeek(wekenData.yearWeek))}
                      onClick={(e) => {
                        // Call the existing callback function
                        props.callBack_changePeriod(wekenData.yearWeek);
                    
                        // Show the tooltip with timeout (assuming handleMouseEnter is adapted for click)
                        handleMouseEnter(wekenData, e);
                        if (timeoutRef.current) {
                          clearTimeout(timeoutRef.current);
                        }
                    
                        // Set a new timeout to hide the tooltip after x seconds (e.g., 3 seconds)
                        timeoutRef.current = setTimeout(() => {
                          handleMouseLeave(); // Hide the tooltip
                        }, 3000); // Adjust the timeout duration (3000ms = 3 seconds)
                      }}

                     
                      onMouseEnter={(e) => handleMouseEnter(wekenData, e)} // Show tooltip on hover
                      onMouseLeave={handleMouseLeave} // Hide tooltip on mouse leave
                      onTouchEnd={handleTouchEnd} // Hide tooltip on touch end
                    > 
                    {/* {Math.round(useMaxOrGem === 'max' ? wekenData.data[0].maxWaarde : wekenData.data[0].gemWaarde)} */}
                    {wekenData.data[0].meta_symbool_aspect &&
                      wekenData.data[0].meta_symbool_last_calc_waarde > 2.5 ? (
                        <span className="large">
                          {wekenData.data[0].meta_symbool_aspect.substr(0, 1)}
                        </span>
                      ) : wekenData.data[0].meta_symbool_aspect ? (
                        <span className="x-small" >
                          {wekenData.data[0].meta_symbool_aspect.substr(0, 1)}
                        </span>
                      ) : (
                        ""
                      )
                    }
                    </td>
                    </>
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
                padding: '5px 6px',
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