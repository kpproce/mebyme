import propTypes from 'prop-types'; // ES6

const ShowResponse = ({JsonData}) => {
// je krijgt een JSON var:  Array met objecten. 
// Doel is deze weer te geven. Hiemee kun je willekeurige response weergeven.
  

  if (Array.isArray(JsonData)) {
    return (
      <table className="songlist">
        <thead>        
          <tr>  
            {Object.keys(JsonData[0]).map(function(key) {
              return <th key={key}>{key}</th>;
            })}     
          </tr>
        </thead>
        <tbody>
          {JsonData.map((line, index)=> {
            return <tr key={index}>
              {Object.keys(line).map(function(key) {
                return <td key={line[key]}>{line[key]}</td>;
              })}
            </tr>
          })}
        </tbody>
      </table>
    )
  } else {
      return (
        <table className="songlist">
          <thead><tr><th>item</th><th>value</th></tr></thead>
          <tbody>
          {Object.keys(JsonData).map(function(key) {
            return <tr key={key}><td  key={key}>{key}</td><td  key={JsonData[key]}>{JsonData[key]}</td></tr>
          })}
          </tbody>
      </table>
      )

  }
} 

ShowResponse.propTypes = {
  JsonData: propTypes.string.isRequired,
}

export default ShowResponse; 