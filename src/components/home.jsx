const Home = (props) => {


  // login places the right apikey and username in the localstorage.
  console.log('Home geweest')
  console.log('username:')

 
  return ( 
    <>
      <h1>Home</h1>
      <h2>Hallo {props.username} </h2> 
      {/* <Avatars/> */}
    </>
  )
};

export default Home;