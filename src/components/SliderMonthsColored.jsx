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
  for (let i = 0; i < 6; i++) { selectOptions[i] = i } 

  const [isHovered, setIsHovered] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipStyle, setTooltipStyle] = useState({});
  const timeoutRef = useRef(null); // Ref to store the timeout ID to remove it after x seconds (tooltip)
 
  const [useMaxOrGem, setUseMaxOrGem] = useState('gem');
  
  const [selected_aspect_meta_bron, setSelected_aspect_meta_bron] = useState(props.aspect_meta_bron); // Initialize with props value
  const [selected_aspect_meta_symbool, setSelected_aspect_meta_symbool] = useState(props.aspect_meta_symbool); // Initialize with props value


  const [isMobile, setIsMobile] = useState(false); // State to track mobile status
  const [isOpen, setIsOpen] = useState(false); // State to track if the select is open
  const handleFocus = () => { setIsOpen(true) };
  const handleBlur = () => { setIsOpen(false) };

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

async function set_meta_bron_API(nieuwe_aspect_meta_bron) {
  const postData = new FormData();
  console.log('107: ')
  //console.log('100 myUsers useffect 1 .. ')   
  postData.append('username', props.username);
  postData.append('apikey', props.apikey);
  postData.append('aspect_meta_bron', nieuwe_aspect_meta_bron);
  postData.append('action', 'set_meta_bron');

  console.log('114: ')
  // console.log(JSON.stringify(postData))

  let requestOptions = {
    method: 'POST',
    body: postData,
  };
  const res = await fetch(props.fetchURL, requestOptions);   
  if (!res.ok) { throw res;}
  return res.json();
} 

async function set_meta_symbool_API(nieuwe_aspect_meta_symbool) {
  const postData = new FormData();
  console.log('128: ')
  //console.log('100 myUsers useffect 1 .. ')   
  postData.append ('username', props.username);
  postData.append('apikey', props.apikey);
  postData.append('aspect_meta_symbool', nieuwe_aspect_meta_symbool);
  postData.append('action', 'set_meta_symbool');

  console.log('135: ')
  // console.log(JSON.stringify(postData))

  let requestOptions = {
    method: 'POST',
    body: postData,
  };
  const res = await fetch(props.fetchURL, requestOptions);   
  if (!res.ok) { throw res;}
  return res.json();
} 


const handle_selected_aspect_meta_symbool = (event) => {
  const newValue = event.target.value;
  setSelected_aspect_meta_symbool(newValue); // Update state with the selected option
  set_meta_symbool_API(newValue); // Call the API function with the new value
  props.callBack_resetDataToRender()
};

const handle_selected_aspect_meta_bron = (event) => {
  const newValue = event.target.value;
  setSelected_aspect_meta_bron(newValue); // Update state with the selected option
  set_meta_bron_API(newValue); // Call the API function with the new value
  props.callBack_resetDataToRender()
};

const handle_weekSliderChange_averagingMethod = (e) => {
  setUseMaxOrGem(e.target.value);
};

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
    <div className='fitIn' style={{ width: "inherit" }}>
    
      <Table striped bordered hover size="sm">
          <tbody>      
            <tr key={"sliderMonthsDataRow0"}>     
              <td key='sliderMontsSettingCell_00' className='sliderWeek_first_tdWidth_mobilePortrait'>
                  <select value={useMaxOrGem} className='small' onChange={handle_weekSliderChange_averagingMethod}>
                    <option value="max">max</option>
                    <option value="gem">gem</option>
                  </select> <span className='space'></span> 
              </td>           

              { create_montNameRow_fromWeeknumbers().map((item, index) => (
                <td key={"weekdat" + index} className='tdBorder' colSpan={item.count}>
                  {item.count>1?item.monthName:""}
                </td>
              ))}
            </tr>   
            <tr key={"sliderMonthsDataRow1"} >  
              <td key='sliderMontsSettingCell_1' className='sliderWeek_first_tdWidth_mobilePortrait'>
              <select 
                  className = 'x-small' 
                  onChange  = {handle_selected_aspect_meta_bron}
                  value     = {selected_aspect_meta_bron} // Set the value from state
                >
                {props.hghAspecten.map((aspectData, index) => (
                    <option 
                      key   = {`aspect-option-${aspectData.aspect}-${index}`} // Gebruik aspectData.aspect voor unieke identificatie
                      value = {aspectData.aspect}
                      title = {aspectData.aspect} // Tooltip showing full text
                    >
                      {isMobile ? aspectData.aspect.substring(0, 10) : aspectData.aspect.substring(0, 6)}
                    </option>
                  ))}
                  </select>
                  <SliderMonthsSettings
                    useMaxOrGem = {useMaxOrGem}
                    callBack_from_settings = {callBack_from_settings}
                  />
              </td>    
              { props.metaWeek.map((wekenData, index) => (
                wekenData.data.length>0?
                  <> 
                  <td 
                    key={ index + "weekDataMaxWaarde1"} 
                     className={"bk_strong_color_" + Math.round(useMaxOrGem === 'max' 
                      ? wekenData.data[0].maxWaarde 
                      : ((wekenData.data[0].gemWaarde*20 + wekenData.data[0].maxWaarde*30)/50) 
                    ) + " tdBorder sliderWeek_tdWidth" }
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
                  </td>
                  </>
                : <td key={ index + "weekData_empty"} className='color_0 tdBorder sliderWeek_tdWidth'> 
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

            {/* De rij met een letter, meestal voor een kuur, zoals Prednison of Antibiotica */}

            <tr key={"sliderMonthsDataRow2"}>  
              <td key='sliderMontsSettingCell_2' className='sliderWeek_first_tdWidth_mobilePortrait sliderWeek_td'>
                <select 
                  className = 'x-small' 
                  onChange  = {handle_selected_aspect_meta_symbool}
                  value     = {selected_aspect_meta_symbool} // Set the value from state
                >
                {props.hghAspecten.map((aspectData, index) => (
                    <option 
                      key     = {index} 
                      value   = {aspectData.aspect}
                      title   = {aspectData.aspect} // Tooltip showing full text
                    >
                      {isMobile ? aspectData.aspect.substring(0, 10) : aspectData.aspect.substring(0, 6)}
                    </option>
                  ))}
                  </select>
                  <SliderMonthsSettings
                    useMaxOrGem = {useMaxOrGem}
                    callBack_from_settings = {callBack_from_settings}
                  />
              </td>    
              { props.metaWeek.map((wekenData, index) => (
                wekenData.data.length>0?
                  <> 
                  <td className='bk_strong_color_0 tdBorder sliderWeek_tdWidth'
                    key={ index + "welkeVoorLetter"} 
                    //className={"color_" + Math.round(wekenData.data[0].maxWaarde) + " tdBorder" }
                  
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
                    wekenData.data[0].meta_symbool_last_calc_waarde > 2.5 
                    ? <span className="x-large fg_color_oneLetter_high oneLetterInSpan">
                        {wekenData.data[0].meta_symbool_aspect.substr(0, 1)}
                      </span>
                    : wekenData.data[0].meta_symbool_aspect 
                      ? <span className="large fg_color_oneLetter_low oneLetterInSpan" >
                          {wekenData.data[0].meta_symbool_aspect.substr(0, 1)}
                        </span>
                      : (
                      ""
                    )
                  }
                  </td>
                  </>
                : <td key={ index + "weekDataMaxWaarde2"} className='bk_strong_color_0 tdBorder sliderWeek_tdWidth sliderWeek_td'>  
                  </td>
              ))}
            </tr>  
          </tbody>
      </Table>
    </div>
  )
}

SliderMonthsColored.propTypes = {
  username                 : PropTypes.string, 
  apikey 	                 : PropTypes.string,
  metaWeek                 : PropTypes.array.isRequired,
  aspect                   : PropTypes.string.isRequired,
  aspect_meta_symbool      : PropTypes.string.isRequired,
  aspect_meta_bron         : PropTypes.string.isRequired,
  hghAspecten              : PropTypes.array,
  fetchURL                 : PropTypes.string,
  callBack_changePeriod    : PropTypes.func.isRequired,
  callBack_resetDataToRender : PropTypes.func.isRequired
}  

export default SliderMonthsColored;