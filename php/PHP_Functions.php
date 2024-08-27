<?php

function isThisAnImages($filename){
    $ext = strtolower(pathinfo(strtolower($filename), PATHINFO_EXTENSION));
    // if ( $filename!=".." && $filename!="..") {
    if ($ext=='jpg' || $ext=='png' || $ext=='jpeg' || $ext=='pdf' || $ext=='jfif') {
        // echo ("--- " . $ext .  " -- ok -- <br>");
        return true; 
    } else { 
        // echo ("XXX " . $ext .  " -- XXX -- <br>");
        return false;
    }
}

function lees_FotoNamen_Van_Image_Map(){ 
    // Leest de fotonamen van de folder images, zoekt eerste jaartal. Stuurt array $myFotoInfo terug
 
    $myFotoInfo = []; // dit is een array met index met daarin associatieve array met 2 items.
    $folder = "images";
    $filename = "";
    $jaartalInFileName = 0;

    // echo ($folder);
    if ($handle = opendir($folder)) {
        while (false !== ($filename = readdir($handle))) {
            if (isThisAnImages($filename)) {
                // echo "<br> --filename: " . $filename .  "<br>";
                // filename gevonden
                    // $jaartalInFileName = zoek_Eerste_Jaartal_In_String($filename);
                    $row = [];
                        $row['filename'] = "$filename";
                        // $row['jaar'] = $jaartalInFileName; // als jaartal in foto staat, voor dez app niet relevant
                        // $row['dir'] = $_SERVER['HTTP_HOST'] . " " . $_SERVER['SERVER_NAME'] . " " . $_SERVER['HTTP_REFERER'];;
                        $row['dir'] = $folder;
                    array_push($myFotoInfo,$row);		
            } else {

            } 
        }
        closedir($handle);
        // echo (gettype($row));
        return 	$myFotoInfo;
    } 
}

function leesFilenames_V2($folder,  $sort) { 

    // Deze functie staat in de php map waar ook de images staan.
    // input:
      // folder. die verschilt per server (local of bij provider) 
      // sort: "noSort, dateSort, nameSort
       // ../images/Silvermusic/Huusband1/guitarJan.png

    // return array: sorted on dateSort
     //   [ {'Silvermusic','start Silvermusic.png',date}, {'Huusband2','janGuitar.png',date} ]

    $imageDataList = [];
     $dir = $folder ;
     $userMessage = "";
     $messages = [];
     $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $request_uri = $_SERVER['REQUEST_URI'];
    $full_url = $protocol . "://" . $host . $request_uri;
     
    array_push($messages, "full_url: " . $full_url);
    array_push($messages, "full_url + dir full : " . $full_url . $dir);
    array_push($messages, "full_url + dir : " . $protocol . "://" . $host . "/mebyme" );
    array_push($messages, "dir : " .  $dir);
    array_push($messages, "getcwd(): " .  getcwd());



    $test = "";
    $path = 
    // echo "$path";
    $imageDataList = [];
    $imageNamesList = [];

    // Open a directory, and read its contents
    array_push($messages, $dir . ' check of dit een folder is?');
    if (is_dir($dir)){
        array_push($messages, $dir . ' is een folder');
        if ($dh = opendir($dir)){
          array_push($messages, $dir . ' kan deze openen');
          while (($filename = readdir($dh)) !== false){
                if (isThisAnImages($filename)) {
                    //echo "filename:" . $filename . " " . date ("Y m F d H", filemtime($dir.$filename));
                    $imageData = [
                        'filename'      => $filename,
                        // 'info'  => "test",
                        'date'          => date ("Y_m_d_H:m", filemtime($dir . '/' . $filename)),
                        'size'          => filesize($dir . '/' . $filename),
                        'dir'           => $dir
                    ];  
                    
                    // echo($filename. "<br>");
                    $test = $test . $filename . ' ';
                    array_push($imageDataList, $imageData);
                    array_push($imageNamesList, $filename);

                } else {
                    // echo($filename . " is not an Image");
                } 
                // echo($filename. "<br>");
            }
            closedir($dh);
        } else {
            array_push($messages, $dir . ' kan deze NIET openen');
        }
    } else {
        array_push($messages, $dir . ' is GEEN folder');
    }

    if ($sort==="dateSort") {
        usort($imageDataList, function($a, $b) {return strcmp($b['date'], $a['date']);});
    }
    if ($sort==="nameSort") {
        usort($imageDataList, function($a, $b) {return strcmp($a['filename'], $b['filename']);});
    }

    $result = [
        'serverInfo'       => $_SERVER,
        'url'              => $imageDataList,
        'imageDataList'    => $imageDataList,
        'imageNamesList'   => $imageNamesList,
        'userMessage'      => $userMessage,
        'messages'         => $messages
    ];
    return $result;
}

function  test_leesFilenames_V2() {

    $subFolderName = './images/mebyme_icons';
    $filenamesResult = leesFilenames_V2($subFolderName, "nameSort" );
    
    echo("<h3>messages</h3>");
    print_r($filenamesResult['messages']);

    echo("<h3>test_leesFilenames</h3>");
    forEach($filenamesResult['imageList'] as $filename) { 
    
        print_r($filename['filename']);
        echo("<h3></h3>");
    }
  
}



function test_LeesFileNames_waarnemingen($subFolderName) {

    // sort: "noSort, dateSort, nameSort
    
    $filesInfo = leesFilenames_V2($subFolderName, 'dateSort');

    foreach ($filesInfo as $fileInfo) {
        echo('<br>');         
        foreach ($fileInfo as $key => $value) {
            echo ($key . ": " . $value );
            echo('<br>');
        }
    } 

}

  // test_LeesFileNames_V3('Silvermusic', 'Huusband2');
  // test_LeesFileNames_waarnemingen('avatars');

  // test_leesFilenames_V2()

?>