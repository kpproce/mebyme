export const maandNamenKort = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']

export const basic_API_url = () => {
 
  let url = ""
  // console.log('6: login: location.hostname' + location.hostname )
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname === "") {
    url = "http://localhost/mebyme/";
  } else {
    url = "https://www.kimproce.nl/mebyme/"
  }
  return url
  // return "http://localhost/mebyme/"
}

export const imageUrl = () => {  // avatars in images/avatars
  let url = ""
  //console.log('19: login: location.hostname' + location.hostname )
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname === "") {
    url = "http://localhost/mebyme/php/images/";
  } else {
    url = "https://www.kimproce.nl/mebyme/images/"
  }
  return url
  // return "http://localhost/mebyme/"
}

export const  provider_API_url = () => {
  return "https://www.kimproce.nl/mebyme/"
}
