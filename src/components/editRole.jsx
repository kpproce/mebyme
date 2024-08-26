import {useState, useRef,  useEffect} from 'react';
import propTypes from 'prop-types'; // ES6
import Form from 'react-bootstrap/Form';

function EditRole(props) {

  const [username_aanvrager, setUsername_Aanvrager] = useState(props.username_aanvrager)

  const [apikey_aanvrager, setApikey_aanvrager] = useState(props.apikey_aanvrager)  
  const [username_to_edit, setusername_to_edit] = useState(props.username_to_edit)
  const [value, setValue] = useState(props.value)

 
  const fetchURL = "http://localhost/waarnemingen/php/v39/beheer/beheerAstmaAppAPI.php"
  
  useEffect (() => { //
    const updateRole = () => {
      let postData = new FormData();
      postData.append ('username_aanvrager', username_aanvrager);
      postData.append('api_aanvrager', apikey_aanvrager);
      postData.append('username_to_edit', username_to_edit);
      postData.append('new_role', value);
      postData.append('action', 'update_role');
  
      const requestOptions = {
        method: 'POST',
        body: postData,
      };
  
      console.log('31 A: value: ' +  value);
      const fetchData = async () => {
  
        const response = await fetch(fetchURL, requestOptions);
        const data = await response.json();
        if (data.succes == false) {
          console.log('40: succes = false')
          setValue(data.oldRole)
        } else { 
          console.log('40: succes = true')
        }
        props.callBack_myUsers_from_editRole(data.userMessage)

      }
  
      fetchData()
    }    
    
    updateRole()
  }, [value])


  const handleSelectChange = (e) => {
    if (confirm(`${username_aanvrager} wijzigt rol van ${username_to_edit} ? `)) {
      setValue(e.target.value);
      console.log('31 B: value: ' +  value);
      console.log('31: C value: ' +  value);
    }
  };

  return (
    <Form.Select value={value} onChange={handleSelectChange}>
      <option value="G">Guest</option>
      <option value="E">Edit</option>
      <option value="A">Admin</option>

    </Form.Select>

  );
} 

// proptypes werkt nog niet helemaal 12 april 2024
 
// https://www.youtube.com/watch?v=SKqFMYOSy4g&ab_channel=LogRocket
// https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/prop-types.md

EditRole.propTypes = {

  value: propTypes.string.isRequired,
  callBack_myUsers_from_editRole: propTypes.func.isRequired
}

export default EditRole; 