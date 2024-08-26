import React, { useEffect, useRef } from 'react';
import ImageUploading from 'react-images-uploading';
// https://www.npmjs.com/package/react-images-uploading


export function UpLoadImages() {
  const [images, setImages] = React.useState([]);
  const maxNumber = 69;

  const onChange = (imageList, addUpdateIndex) => {
    // data for submit
    console.log('12: ');
    console.log(imageList, addUpdateIndex);
    setImages(imageList);
  };

  useEffect (() => {


  }, []) 


  const inputFileRef = useRef();

  const handleBtnClick = () => {
    inputFileRef.current.click();
  }

  return (
    <div className="App">
      < ImageUploading
          multiple
          value={images}
          onChange={onChange}
          maxNumber={maxNumber}
          dataURLKey="data_url"
      >
        {({
          imageList,
          onImageUpload,
          onImageRemoveAll,
          onImageUpdate,
          onImageRemove,
          isDragging,
          dragProps,
        }) => (
          // write your building UI
          <div className="upload__image-wrapper">
            <button
              //style={isDragging ? { backgroundColor: 'lightblue', height:'5rem'} : undefined}
              onClick={onImageUpload}
              
              //{...dragProps}
            >
              Click or Drop here !
            </button>
            <div  
              className='dragzone'
              style={isDragging ? { backgroundColor: 'lightblue', height:'5rem'} : undefined}
              {...dragProps}
            >
              dragzone
              &nbsp;
              <button onClick={onImageRemoveAll}>Remove all images</button>
              {imageList.map((image, index) => (
                <div key={index} className="image-item"
                >
                  {console.log('56: image')}
                  {console.log(image.file.name)}
                  <img src={image['data_url']} alt="" width="100" />
                  <div className="image-item__btn-wrapper">
                    <button onClick={() => onImageUpdate(index)}>Update</button>
                    <button onClick={() => onImageRemove(index)}>Remove</button>
                    <button onClick={() => onImageUpload(index)}>Upload</button>
                  </div>
                </div>
              ))}
            </div>
           
          </div>

        )}
        
      </ImageUploading>
    </div>
  );
}



export  default UpLoadImages

/*
  {({ imageList, dragProps, isDragging }) => (
    <div {...dragProps}>
    {isDragging ? "Drop here please" : "Upload space"}
    {imageList.map((image, index) => (
      <img key={index} src={image.data_url} />
    ))}
    </div>
  )}
*/