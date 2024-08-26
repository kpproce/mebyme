<?php  

 header('Access-Control-Allow-Origin: *');
//  header('Content-Type: application/json');
 header("Access-Control-Allow-Methods: POST");
 header("Access-Control-Max-Age: 3600");
 header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");


 include_once 'PHP_Functions.php';  //read filenames, isImage? etc..
//  alle PHP api functies van versie 39 staan hieronder

    function connect() {
        $user_host = $_SERVER['HTTP_HOST']; //   
        if  ($user_host == "localhost") {
            // echo "localhost:";
            $servername = "localhost";
            $myDatabase = "mebyme";
            $dbUsername = "root";
            $password = "";
            $localhost = "localhost (eigen laptop)"; 

        } else {
            // echo "geen localhost:";

            $servername   = "localhost";
            $myDatabase   = "kimproce_mebyme";
            $dbUsername   = "kimproce_mebymedb01";
            $password     = "NBz9m5tbqYCg";
            $localhost    = "localhost bij externe server: " .$user_host ; 
        }
        mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
        return new mysqli($servername, $dbUsername, $password, $myDatabase);
    }

    function passwordValid($conn, $username, $password) {
        $n = -1;
        $stmt = $conn->prepare("SELECT COUNT(1) FROM users WHERE username=? AND password=?");
        // echo ("----valid: " . $username . " -- " . $apikey . " -- ");
        $stmt -> bind_param("ss", $username, $password);
        $stmt -> execute();
        $stmt -> bind_result($n);
        $stmt -> fetch();
        return ($n==1);
    }

    function apikeyValid($conn, $username, $apikey) {
        $n = -1;
        $stmt = $conn->prepare("SELECT COUNT(1) FROM users WHERE username=? AND apikey=?");
        // echo ("----valid: " . $username . " -- " . $apikey . " -- ");
        $stmt -> bind_param("ss", $username, $apikey);
        $stmt -> execute();
        $stmt -> bind_result($n);
        $stmt -> fetch();
        
        // echo ("<br>" . $n);
        return ($n==1);
    }

    function apikeyValidation($conn, $username, $apikey) {
        $n = -1;
        
        $stmt = $conn->prepare("SELECT username, apikey, DATE(expire) as expireDate FROM users WHERE username=? AND apikey=?");
        
        // echo ("----valid: " . $username . " -- " . $apikey . " -- ");
        $stmt -> bind_param("ss", $username, $apikey);
        $stmt -> execute();
        $result = $stmt->get_result();
        
        // gevonden met deze apikey? ofwel is er exact 1 row?
        if ($result->num_rows > 0) {
            $date_today = date("Y-m-d");
   
            $row = $result->fetch_assoc();
            $apikey_expireDate = $row['expireDate'];
            if ($date_today > $apikey_expireDate) { 
                return "apikey_expired"; 
            } else { 
                return "apikey_okay";
            };
            
        } else {
            return "username_apikey_notFound";
        }
    }

    function missingInputParameters($inp, $items) { // v4.4
        $messages = [];
        foreach ($items as $item) {  // check of dit item voorkomt in $input
            if (!array_key_exists($item, $inp)) array_push($messages, $item . ' missing in input parameters');
        }
        return $messages; // als leeg dan allemaal gevonden
    }
   
    function createApikey($apikey_type, $username) {
        if ($apikey_type =="simple") {
            return ($username. "apikey" . rand(1,9));
        } else {
            return bin2hex(random_bytes(16));  
        }
    }

    function update_apikey($conn, $username, $new_apikey, $expire_date) {
        $message = "update apikey voor user $username uitgevoerd";
        $query = "UPDATE users set apikey=?, expire=? WHERE username=? ";

        $stmt = $conn->prepare($query);
        $stmt -> bind_param("sss",  $new_apikey, $expire_date, $username);
    
        if ($stmt->execute() === true) {
            if ($conn->affected_rows == 1) {
                $message = "update apikey voor user $username uitgevoerd";
            }
        } 
        return $message;
    }

    function admin_rights($conn, $username, $apikey) {
        $n = -1;
        $stmt = $conn->prepare("SELECT COUNT(1) FROM users WHERE username=? AND apikey=? AND role='A' ");
        // echo ("----valid: " . $username . " -- " . $apikey . " -- ");
        $stmt -> bind_param("ss", $username, $apikey);
        $stmt -> execute();
        $stmt -> bind_result($n);
        $stmt -> fetch();
       
        // echo ("<br>" . $n);
        return ($n==1);
    }

    function login($inp) {  // op basis van username, apilkey of password

        // de essentie is dat een user met username en apikey kan inloggen. Als de api  key verlopen is, dan kan dat niet meer. 
        // De api key wordt lokaal bewaard en daarom hoeft de gebruiker zolang de apikey niet expired is zonder inloggen in het systeem.
        // Door in te loggen met username en password krjjgt de gebruiker een nieuwe apikey en is daarmee ingelogd
        // 

        $mysqli              = connect();
        $messages = [];
        $result_message = '-';
        $result_message_details = ''; 

         if (array_key_exists('usernameLogin', $inp))   $username =     $inp['usernameLogin']; else { $username='';}
         if (array_key_exists('apikey', $inp))          $apikey =       $inp['apikey'];        else { $apikey='';}
         if (array_key_exists('apikey_type', $inp))     $apikey_type =  $inp['apikey_type'];   else { $apikey_type='complex';}
         if (array_key_exists('password', $inp))        $password =     $inp['password'];      else { $password='';}

        $avatar              = "";

        $apikey_or_password  = $inp['apikey_or_password']; // Log je in met password --> nieuwe API en expiredate --> ingelogd
        $date_today          = date("Y-m-d");

        $logged_in = false;                       
        $username_exists = false ;  // true false
        $username_password_correct = false;
        $apikey_correct =    '--' ;  // yes, no
        $apikey_expired =  '--';  // yes, no
        $apikey_expireDate = "1900-01-01";

        // check login with apikey or login with password

        $query =  "SELECT username, avatar, apikey, DATE(expire) as expireDate FROM users";
        $query .= " WHERE username = ?";
        array_push($messages, $query);

        /* Select queries return a resultset */
        $stmt = $mysqli->prepare($query);
        $stmt->bind_param("s", $username);
        if ($stmt->execute() === true) {
            $queryResult = $stmt->get_result();
            if ($queryResult->num_rows  > 0) {      // username bestaat
                $row = $queryResult->fetch_assoc();
                $username_exists = true;
            
                // var_dump("<h4> apikey_or_password: $apikey_or_password </h4>");
                if (strcmp($apikey_or_password, "password")==0) { // check login en maybe generate new apikey 
                    // var_dump('<h4> met password ingelogd </h4>');
                    if (passwordValid($mysqli, $username, $password)) { // 
                        $username_password_correct = true;
                        // var_dump('<h4> password valid </h4>');
                        // $apikey = createApikey($apikey_type, $username);
                        $apikey = $row['apikey'];
                        
                        //$apikey_expireDate = date('Y-m-d', strtotime('+1 month')); // standaard expire periode                  
                        // update_apikey($mysqli, $username, $apikey, $apikey_expireDate) ;
                        $logged_in = true ;
                        $apikey_correct   = 'ja';
                        $apikey_expired = 'not known';
                        array_push($messages, 'username password correct');
                        array_push($messages, "niewe apikey: $apikey,  expireDate: $apikey_expireDate ");
                        $result_message = "ingelogd";  
                        $result_message_detail = "ingelogd, nieuwe apikey, verloopt: $apikey_expireDate ";  
                        $avatar = $row['avatar'];

                    } else { // wil inloggen met password, maar password niet correct
                        $apikey = 'inlog fout';
                        array_push($messages, 'password niet correct');
                        $result_message = 'user/pass fout';  
                        $result_message_detail = 'inloggen Niet gelukt username/password niet correct';  
                        $logged_in = false;
                    }
                } else { // --------- inloggen met apikey    --------------
                   
                    // var_dump('<h4> met APIKEY ingelogd </h4>');
                    $apikeyValid = apikeyValidation($mysqli, $username, $apikey);
                        // returns "apikey_expired",  "apikey_okay", "username_apikey_notFound"
                    if ($apikeyValid == "username_apikey_notFound") {
                        $result_message_details = 'inloggen Niet gelukt met apikey, log opnieuw in met username en password.'; 
                        $result_message = 'apikey fout';
                        $logged_in = false;

                    } else if ($apikeyValid == "apikey_expired") {
                        $result_message_details = 'apikey verlopen --> vraag nieuw aan (nog niet gebouwd)'; 
                        $result_message = 'apikey verlopen'; 
                        $avatar = $row['avatar'];
                        $logged_in = false;

                    } else if ($apikeyValid == "apikey_okay") { 
                        $result_message_details = "$username: automatisch met apikey ingelogd"; 
                        $result_message = 'apikey okay';
                        $logged_in = true;
                        $avatar = $row['avatar'];

                    } else {
                        $result_message = 'apikey controle niet gelukt, log opnieuw in, vraag beheerder'; 
                        $avatar = $row['avatar'];
                        $logged_in = false;
                        // apikey controle niet gelukt
                    }                    
                    array_push($messages, 'expire date: ' . $row['expireDate']);
                }

            } else { // USER niet gevonden
                array_push($messages, "user $username  niet gevonden");
                $result_message = "user: $username niet gevonden, niet ingelogd";  
                $apikey = 'inlog fout';
            }
            array_push($messages, "fout in query");
        }

        $result = [
            // ****** LET OP queryResult is een associative array met een message en de dataArray
            'username'                  => $username,
            'avatar'                    => $avatar,
            'logged_in'                 => $logged_in,
            'username_exists'           => $username_exists,
            'username_password_correct' => $username_password_correct,
            'apikey_correct'            => $apikey_correct,
            'apikey_expired'            => $apikey_expired,
            'apikey'                    => $apikey,
            'apikey_expireDate'         => $apikey_expireDate,
            'messages'                  => $messages,
            'date_today'                => $date_today,
            'result_message'            => $result_message,
            'result_message_details'    => $result_message_details
            ];
        return $result;
    }

    function update_role($inp, $mode) { // van 1 user door admin v4.4, haal ook de oude rol op, voor als de role niet gewijzigd wordt
        $mysqli = connect();
        $error = "";
        $resultData = [];   
        $messages = [];
        $userMessage = "";
        $succes = false;
        $queries = []; // voor testen, deze worden niet gebruikt in de code hieronder, daar wordt bind_parameters gebruikt, 
        $oldRole = "";

        $missingInputParameters = missingInputParameters($inp, ['username_to_edit','username_aanvrager','api_aanvrager', 'new_role']);
    
        if (count($missingInputParameters)==0) { //alle items aanwezig
            
            $username_to_edit   = $inp['username_to_edit'];  
            $username_aanvrager = $inp['username_aanvrager']; 
            $api_aanvrager      = $inp['api_aanvrager'];
            $newRole           = $inp['new_role'];         // verschillende schrijfwijze front en backend
            
            
            if ( admin_rights($mysqli, $username_aanvrager, $api_aanvrager ) )  {

                if ( strcmp($username_to_edit, $username_aanvrager) == 0 ) {
                    $userMessage = "Wijzigen van je eigen rechten als administrator is niet mogelijk";
                } else {

                    // ****************  haal de oude role op  ******************* 

                    $query = "SELECT role FROM users WHERE username = ? ";
                    $queryTst = "SELECT * FROM users WHERE username = '$username_to_edit' ";
                    
                    $stmt = $mysqli->prepare($query);
                    $stmt->bind_param("s", $username_to_edit);
                    
                    if ($stmt->execute() === true) {
                        $queryResult = $stmt->get_result();

                        if ($queryResult -> num_rows >0 ) {
                            $row = $queryResult->fetch_assoc();
                            $oldRole = $row['role'];
                            $succes = true;
                        } else 
                        $userMessage = "Geen resultaten voor $username_to_edit, bestaat deze user?"; 
                        

                    }
                    
                     // ****************  haal de oude role op  ******************* 


                    if ($succes == true ) {

                        $succes = false;
                        $query =  "UPDATE users set role = ? WHERE username = ? ";
                        array_push($queries, "UPDATE users set role = '$newRole' WHERE username = '$username_to_edit' ");

                        $stmt = $mysqli->prepare($query);
                        $stmt->bind_param("ss", $newRole, $username_to_edit);
                        //$stmt->bind_param();

                        if ($stmt->execute() === true) 
                            if ($stmt->affected_rows == 1) $succes = true;
                            else $userMessage = "Mogelijk was de role al $newRole";
                    }
                }

            } else {
                $userMessage = `user $username_aanvrager heeft onvoldoende rechten om role aan te passen`;
            }
        } else {
            $userMessage = "Er mist een parameter in de input, deze functie (in de api) moet met de juiste paramaters aangeroepen worden!";
        }

        $result = [
            'queries'                => $queries,
            'missingInputParameters' => $missingInputParameters,
            'oldRole'                => $oldRole,
            'newRole'                => $newRole, // from the input
            'userMessage'            => $userMessage,
            'succes'                 => $succes
            
        ];
        return $result;
    }

    function get_naam_alle_medicijnen($inp, $mode) {
      
        $mysqli = connect();
        $username = $inp['username']; 
        $resultData = [];   
        $messages = [];
    
        $query =  "SELECT distinct naam as medicijnNaam FROM medicijnen";
        $query .= " ORDER BY basicOrder ";

        array_push($messages, $query);

        if ($mode=="test") { 
            echo ('<h3> medicijnen lijst</h3>');
            echo ('<br>');
            echo ($query);
            echo ('<br>');
        }
        /* Select queries return a resultset */
        $queryResult = $mysqli->query($query);
        if ($queryResult->num_rows > 0) { // output data of each row         
            while($row = $queryResult->fetch_assoc()) {
                array_push($resultData, $row);    
            }
            array_push($messages, " lijst opgehaald:" . strval($queryResult->num_rows) . " regels uit de database opgehaald");
        }

        $result = [
            // ****** LET OP queryResult is een associative array met een message en de dataArray
            'resultData' => $resultData,
            'query'      => $query,
            'messages'   => $messages
        ];
        return $result;
    }
   
    function get_data_1_medicijn($inp, $mode) { // alleen van medicijn!
      
        $mysqli = connect();
        $username      = $inp['username']; 
        $medicijnNaam  = $inp['medicijnNaam'];
        $resultData = [];   
        $messages = [];
    
        // check if user has rights ...

        $query =  "SELECT * FROM medicijn_info WHERE naam = '$medicijnNaam'";
        array_push($messages, $query);
        $queryResult = $mysqli->query($query);
        if ($queryResult->num_rows > 0) { // output data of each row         
            while($row = $queryResult->fetch_assoc()) { array_push($resultData, $row); }
            array_push($messages, " lijst opgehaald:" . strval($queryResult->num_rows) . " regels uit de database opgehaald");
        }

        $result = [
            // ****** LET OP queryResult is een associative array met een message en de dataArray
            'resultData'   => $resultData,
            'messages'     => $messages
        ];
        return $result;
    }

    function get_user_settings_1_medicijn($inp, $mode) { // settings van 1 medicijn van een user
      
        $mysqli = connect();
        $username      = $inp['username']; 
        $medicijnNaam  = $inp['medicijnNaam'];
        $resultData = [];   
        $messages = [];
    
        // check if user has rights ...

        $query = "SELECT * FROM medicijn_settings_en_group_view WHERE username = '$username' AND medicijn = '$medicijnNaam' ";
        array_push($messages, $query);
        if ($mode=="test") { echo ($query); }

        $queryResult = $mysqli->query($query);
        if ($queryResult->num_rows > 0) { // output data of each row         
            while($row = $queryResult->fetch_assoc()) { array_push($resultData, $row); }
            array_push($messages, " lijst opgehaald:" . strval($queryResult->num_rows) . " regels uit de database opgehaald");
        }

        $result = [
            // ****** LET OP queryResult is een associative array met een message en de dataArray
            'resultData'   => $resultData,
            'query'        => $query,
            'messages'     => $messages
        ];
        return $result;
    }

    function koppel_medicijn_aan_user( $inp, $mode ) { 
          // Dit medicijn koppelen aan de user.
          // 1) check of dit medicijn al gekoppeld is (zou vanuit de website niet kunnen, daarom nog niet gebouwd )  
          // 2a) Maak regel aan in medicijn_settings_per_user 
          // 2a) Maak regel aan in medicijn_soorten_settings_per_user	

        $mysqli = connect();
    
        $username        = $inp['username']; 
        $for_user        = $inp['for_user'];  // eventueel kan een admin koppelen voor een user.      
        $apikey          = $inp['apikey']; 
        $medicijnNaam    = $inp['medicijnNaam'];
        $medicijn_soort  = substr($medicijnNaam, 0, strpos($medicijnNaam, '_'));

        $resultData = [];   
        $messages = [];
        $userMessage = "Koppeling $medicijnNaam aan $for_user niet uitgevoerd";
    
        // check if username has rights ... 

        // check if it allready existst for for_user ....

        $query =  "SELECT * FROM medicijn_settings_per_user WHERE medicijn= '$medicijnNaam' AND username='$for_user'";
        $queryResult = $mysqli->query($query);
        if ($queryResult->num_rows > 0) { // output data of each row         
            array_push($messages, "$medicijnNaa niet toegevoegd aan medicijn_settings, want is daar al gekoppeld");
        } else {
            $query =  "INSERT INTO medicijn_settings_per_user (username, medicijn)";
            $query .= "VALUES('$for_user', '$medicijnNaam')" ;
            $queryResult = $mysqli->query($query);

            if ($queryResult === TRUE) {
                array_push($messages, "$medicijnNaam,  gekoppeld met '$for_user' ");
                $userMessage = "Koppeling $medicijnNaam aan $for_user uitgevoerd";
            } else {
                array_push($messages, "Onbekende FOUT ->  $medicijnNaam, NIET gekoppeld met  $for_user"); 
            }
        } 

        $query =  "SELECT * FROM medicijn_soorten_settings_per_user WHERE medicijn_soort= '$medicijn_soort' AND username='$for_user'";
        $queryResult = $mysqli->query($query);
        if ($queryResult->num_rows > 0) { // output data of each row         
             array_push($messages, "$medicijn_soort niet toegevoegd aan medicijn_soort_settings , want is daar al al gekoppeld");
        } else {
            $query =  "INSERT INTO medicijn_soorten_settings_per_user (username, medicijn_soort)";
            $query .= "VALUES('$for_user', '$medicijn_soort')" ;
            $queryResult = $mysqli->query($query);

            if ($queryResult === TRUE) {
                 array_push($messages,  "$medicijn_soort,  gekoppeld met '$for_user' ");
            } else {
                 array_push($messages, "Onbekende FOUT ->soort $medicijn_soort, NIET gekoppeld met  $for_user"); 
            }
        } 
        $result = [
            'query'       => $query,
            'messages'    => $messages,
            'userMessage' => $userMessage
        ];
        return $result;
    }

    function update_User_1MedicijnData($inp, $mode) { // alleen van 1 medicijn van 1 user!
              
        $mysqli = connect();
           
        $username            = $inp['username']; 
        $for_user            = $inp['for_user']; 
        $medicijn            = $inp['medicijn'];
        $medicijn_soort      = substr($medicijn, 0, strpos($medicijn, '_'));
        $orderInList         = $inp['orderInList'];
        $bijInvoerTonen      = $inp['bijInvoerTonen'];
        $inOverzichtTonen    = $inp['inOverzichtTonen'];

        $min_inname_dag      = $inp['min_inname_dag'];
        $norm_min_inname_dag = $inp['norm_min_inname_dag'];
        $norm_max_inname_dag = $inp['norm_max_inname_dag'];
        $max_inname_dag         = $inp['max_inname_dag'];

        $resultData = [];   
        $messages = [];

        // update data in de tabel medicijn_settings_per_user

        $query =  "UPDATE medicijn_settings_per_user SET orderInList = ?, bijInvoerTonen = ?";
        $query .= " WHERE medicijn = ? AND username = ? ";

        $stmt = $mysqli->prepare($query);
        $stmt->bind_param("ssss", $orderInList, $bijInvoerTonen, $medicijn, $for_user);
        if ($stmt->execute() === true) {
            if ($mysqli->affected_rows >0) {
                array_push($messages, "orderInList bij: $medicijn: ,  aagepast voor $for_user");
            } else {                
                array_push($messages, "orderInList bij: $medicijn: ,  NIET aangepast, geen wijzigingen of niet gevonden" );
            }
        } else {
            array_push($messages, "FOUT orderInList bij: $medicijn, NIET aangepast voor $for_user"); 
        }
        array_push($messages, $query);

        // update SOORTEN data in de tabel medicijn_soorten_settings_per_user

        $query =  "UPDATE medicijn_soorten_settings_per_user " ;
        $query .= " SET inOverzichtTonen   = ? ";
        $query .= ", min_inname_dag   = ? ";
        $query .= ", norm_min_inname_dag = ? ";
        $query .= ", norm_max_inname_dag = ? ";
        $query .= ", max_inname_dag      = ? ";
        $query .= " WHERE medicijn_soort = ? AND username = ? ";

        $stmt = $mysqli->prepare($query);
        $stmt->bind_param("siiiiss", $inOverzichtTonen,$min_inname_dag, $norm_min_inname_dag,  $norm_max_inname_dag, $max_inname_dag, $medicijn_soort, $for_user);
        if ($stmt->execute() === true) {
            if ($mysqli->affected_rows >0) {
                array_push($messages, "gegevens van medicijnSOORT: $medicijn_soort: ,  voor $for_user aagepast");
            } else {                
                array_push($messages, "gegevens van medicijnSOORT: $medicijn_soort: ,  voor $for_user NIET aagepast, geen wijzigingen of niet gevonden");
            }
        } else {
            array_push($messages, "FOUT in update: $medicijn_soort, gegevens NIET aangepast voor $for_user"); 
        }

        $result = [
            'messages'  => $messages
        ];
        return $result;
    }

    function insert_MedicijnData($inp, $mode) { // alleen van medicijn!
      
        $mysqli = connect();
        $naam =         
        $username = $inp['username']; 
        $naam     = $inp['new_medicijnSoort'] . '_' . $inp['new_medicijnToevoeg'];
        $zwaarte  = $inp['new_zwaarte'];
        $vorm     = $inp['new_vorm'];
        $status   = $inp['new_status'];

        $resultData = [];   
        $message = "";
    
        // check if user has rights ...

        // check if it allready existst

        $query =  "SELECT * FROM medicijnen WHERE naam = '$naam'";
        $queryResult = $mysqli->query($query);
        if ($queryResult->num_rows > 0) { // output data of each row         
            $message = "$naam niet toegevoegd, want staat al in de database ";
        } else {

            $query =  "INSERT INTO medicijnen (naam, zwaarte, vorm, createdByUser, status) ";
            $query .= "VALUES('$naam', $zwaarte, '$vorm', '$username', '$status')" ;
            $queryResult = $mysqli->query($query);

            if ($queryResult === TRUE) {
                $message =  "medicijn: $naam,  zwaarte: $zwaarte, $vorm, $status ingevoerd door $username";
            } else {
                $message = "FOUT medicijn $naam, zwaarte: $zwaarte, $vorm, $status  NIET ingevoerd door $username"; 
            }
        } 
        $result = [
            'query'    => $query,
            'message'  => $message
        ];
        return $result;
    }

    function update_MedicijnData($inp, $mode) { // alleen van een specifiek medicijn, los van user dus!
      
        $mysqli = connect();
           
        $username = $inp['username']; 
        $naam     = $inp['select_medicijnenBeheer'];

        $medicijn_soort  = substr($naam, 0, strpos($naam, '_'));
        $resultData = [];   
        $message = "";

        $zwaarte  = $inp['edit_zwaarte'];
        $vorm     = $inp['edit_vorm'];
        $status   = $inp['edit_status'];
        
        $edit_medicijn_kleur   = $inp['edit_medicijn_kleur'];

        // check if user has rights ...
         
        $query =  "UPDATE medicijnen SET zwaarte = ?, vorm = ?, status = ? ";
        $query .= " WHERE naam = '$naam' ";
        if ($mode=="test") { echo ($query); }
        $stmt = $mysqli->prepare($query);
        $stmt->bind_param("sss", $zwaarte, $vorm, $status);
        //$stmt->bind_param();

        if ($stmt->execute() === true) {
            $message =  "medicijn: $naam,  zwaarte: $zwaarte, $vorm, $status  aagepast door $username";
        } else {
            $message = "FOUT medicijn: $naam,  zwaarte: $zwaarte, $vorm, $status  niet aangepast door $username"; 
        }
        
        $query =  "UPDATE medicijn_soorten_settings SET kleurInApp = ?";
        $query .= " WHERE medicijn_soort = '$medicijn_soort' ";
        if ($mode=="test") { echo ($query); }
        $stmt = $mysqli->prepare($query);
        $stmt->bind_param("s", $edit_medicijn_kleur);
        $query1 =  $query =  "UPDATE medicijn_soorten_settings SET kleurInApp = '$edit_medicijn_kleur'";
        $query .= " WHERE medicijn_soort = '$medicijn_soort' ";
       

        if ($stmt->execute() === true) {
            $message =  "medicijn: $naam,  zwaarte: $zwaarte, $vorm, $status kleur: $edit_medicijn_kleur   aagepast door $username";
        } else {
            $message = "FOUT .. medicijn: $naam,  zwaarte: $zwaarte, $vorm, $status  kleur: $edit_medicijn_kleur niet aangepast door $username"; 
        }
        

        $result = [
            'query'    => $query1,
            'message'  => $message
        ];
        return $result;
    }

    function create_alle_dagen($oudeLijst, $startDate, $endDate) { 
        // NIET AF WANT MEERDERE data op 1 dag mogelijk en dan moet de data onevenredig veel verbouwd worden 
        $nieuweLijst = [];

        // Creeer de niewe lijst 
        // $startDate is van het type Date 
        
        $loopDate = $startDate; // Moet een kopie zijn
    
        while ($loopDate < $endDate) {
            $nieuweitem = [ 'date'  => $date, 'data'  => $data ];
            array_push( $nieuweLijst, $nieuwItem);
        }

        foreach ($oudeLijst as $dagData) {
            # code...
        }

        return $nieuweLijst; 
    }

    // *****************************************************************************************
    //     Haal gekoppelde en te koppelen medicijnen op voor spec user.
    // ***************************************************************altijd**************************

    function get_medicijnLijst_user($inp, $mode) { // 
        // geeft 2 lijsten terug alle gekoppelde medicatie, en te koppelen medicatie
        $mysqli = connect();
        $messages = [];
        $username = $inp['username']; 

        $gekoppelde_medicijnen = []; 
        $te_koppelen_medicijnen = [];
       
        if (apikeyValid($mysqli, $username, $inp['apikey'])) {
            $query = "SELECT orderInList, medicijn, bijInvoerTonen, inOverzichtTonen FROM medicijn_settings_en_group_view WHERE username = '$username' ";
            array_push($messages, $query);
            if ($mode=="test") { echo ($query); }

            $queryResult = $mysqli->query($query);
            if ($queryResult->num_rows > 0) { // output data of each row         
                while($row = $queryResult->fetch_assoc()) {
                    array_push($gekoppelde_medicijnen, $row);    
                }
                array_push($messages, " gekoppelde medicatie: " . strval($queryResult->num_rows) . " regels uit de database opgehaald");
            }

            $query =  "SELECT medicijn FROM medicijn_settings_en_group_view WHERE medicijn NOT IN 
                        (SELECT medicijn FROM medicijn_settings_en_group_view WHERE username = '$username')";
            array_push($messages, $query);
            if ($mode=="test") { echo ($query); }

            $queryResult = $mysqli->query($query);
            if ($queryResult->num_rows > 0) { // output data of each row         
                while($row = $queryResult->fetch_assoc()) {
                    array_push($te_koppelen_medicijnen, $row);    
                }
                array_push($messages, " Nog te koppelen medicatie: " . strval($queryResult->num_rows) . " regels uit de database opgehaald");
            } 
        } else {
            array_push($messages, " apikey: " . $inp['apikey'] . ' is niet geldig voor ' . $username ) ;
        }

        $result = [
            // ****** LET OP queryResult is een associative array met een message en de dataArray
            'gekoppelde_medicijnen'  => $gekoppelde_medicijnen,
            'te_koppelen_medicijnen' => $te_koppelen_medicijnen,
            'messages'               => $messages
        ];
        return $result;
    }

    // **********************************************
    //     HGH periode
    // **********************************************
    
    function get_hgh_period($inp) {  // meByme 
        $mysqli = connect();
        $messages  = [];
        $username  = $inp['username']; 
        $apikey    = $inp['apikey'];
        $startDate = $inp['startDate'];
        $endDate   = $inp['endDate'];
        $data = []; 
        $allAspectRows      = []; 
        $teTonenAspecten    = []; 
        $overigeAspecten    = [];
        $teTonenAspectTypes = [];
        $iconsData          = [];

       
        if (apikeyValid($mysqli, $username, $apikey)) {
            $query  = "SELECT datum, sliderRij, aspect, icon, waarde, opmerking, bijInvoerTonen ";
            $query .= " FROM hoegaathetview  ";
            $query .= "  WHERE username = ? AND datum >= ? AND datum <= ? ";
            $query .= "  AND (bijInvoerTonen = 'ja') AND sliderRij > 0 ";
            $query .= "  ORDER BY sliderRij, datum ";
            
            $tstQuery  = "SELECT datum, sliderRij, aspect, icon, waarde, opmerking, bijInvoerTonen";
            $tstQuery .= " FROM hoegaathetview  ";
            $tstQuery .= "  WHERE username = '$username' AND datum >= '$startDate' AND datum <= '$endDate'";
            $tstQuery .= "  AND sliderRij>0 ORDER BY sliderRij, datum ";
            array_push($messages, $tstQuery);
            
            $stmt = $mysqli->prepare($query);
            $stmt->bind_param("sss", $username, $startDate, $endDate);

            if ($stmt->execute() === true) {
                $queryResult = $stmt->get_result();
                
                if ($queryResult->num_rows > 0) {  
                    while($row = $queryResult->fetch_assoc()) { array_push($data, $row); }
                    /*
                    var_dump("731: <h3> de data: is een " . gettype($data) .  " <h3/>");
                       foreach ($data as $dataRow) {
                        echo("<h3>" . $dataRow['aspect'] . ': ' . $dataRow['icon'] . " <h3/>");
                    }  */
                    
                    // splits de $data in verschillende arrays per aspect
                    // maak per aspect een lege array
                    $aspectRows    = [];  //alle data rijen van 1 aspect
                    $allAspectRows = [];  // de verzameling van $aspectRows (de nieuwe array)

                    // print_r("<h3>-- data[0] --<h3/>");
                    // print_r($data[0]);
                    $currentAspect = $data[0]['aspect'];
                    $currentIcon = $data[0]['icon'];
                    // print_r("<p> ............ EERSTE  ASPECT " . $currentAspect . " <p/>  ..........");

                    foreach ($data as $dataRow) {
                        if  (strcmp($dataRow['aspect'], $currentAspect) !== 0) { 
                            // voeg dataRow toe aan nieuwe lijst 
                            //print_r("<h3>data:<h3/>");
                            //echo("<h3>aspInfo:"  . $currentAspect . ' '  . $currentIcon .  '  <h3/>' );  
                        
                            $toeTeVoegenLijst = [
                                // ****** LET OP queryResult is een associative array met een message en de dataArray
                                'aspect'  => $currentAspect,
                                //'icon'    => isset($data['icon']) ? $data['icon'] : 'geenIcon',
                                'icon'    => $currentIcon,
                                'data'    => $aspectRows
                            ];
                            array_push( $allAspectRows, $toeTeVoegenLijst );
                            $currentAspect = $dataRow['aspect'];   
                            $currentIcon = $dataRow['icon'];            
                            $aspectRows = [];
                            array_push( $aspectRows, $dataRow);
                        } else {
                            array_push( $aspectRows, $dataRow);
                        }
                    }
                            
                    $toeTeVoegenLijst = [
                        // ****** LET OP queryResult is een associative array met een message en de dataArray
                        'aspect'  => $currentAspect,
                        //'icon'    => isset($data[0]['icon']) ? $data[0]['icon'] : 'geenIcon',
                        'icon'    => $dataRow['icon'],
                        'data'    => $aspectRows
                        
                    ];
                    array_push( $allAspectRows, $toeTeVoegenLijst );
                }


            } else 
                array_push($messages, " fout in query " . $query . " " . $username);
        
            $queryAspects  = "SELECT aspect, icon, aspect_type, bijInvoerTonen, inOverzichtTonen FROM `aspect_settings_per_user_view` "; 
            $queryAspects .= " WHERE username = '$username' AND (bijInvoerTonen = 'ja'  OR bijInvoerTonen = 'kan') " ;     

            array_push($messages, $queryAspects);

            $teTonenAspecten = [];      
            $queryResult = $mysqli->query($queryAspects);
            if ($queryResult->num_rows > 0) { // output data of each row         
                while($row = $queryResult->fetch_assoc()) {
                    array_push($teTonenAspecten, $row);    
                }
                array_push($messages, " lijst te tonen aspecten opgehaald");
            }

            $queryAspectTypes  =   "SELECT aspect_type FROM `aspect_settings_per_user_view` "; 
            $queryAspectTypes  .= " WHERE username = '$username' AND (bijInvoerTonen = 'ja'  OR bijInvoerTonen = 'kan') "; 
            $queryAspectTypes  .= " GROUP by aspect_type ORDER BY sliderRij "; 
                       
            array_push($messages, $queryAspectTypes);

            $teTonenAspectTypes = [];      
            $queryResult = $mysqli->query($queryAspectTypes);
            if ($queryResult->num_rows > 0) { // output data of each row         
                while($row = $queryResult->fetch_assoc()) {
                    array_push($teTonenAspectTypes, $row{'aspect_type'});    
                }
                array_push($messages, " lijst te tonen aspecten opgehaald");
            }

            $queryOverigeAspecten  =   "SELECT aspect_type, aspect, basicOrder FROM aspecten WHERE aspect not in ( "; 
            $queryOverigeAspecten  .=  " SELECT aspect from aspect_settings_per_user  WHERE username = '$username' ) ";  
            $queryOverigeAspecten  .=  " AND status='actueel' ORDER by basicOrder";  

            array_push($messages, $queryOverigeAspecten);

            $overigeAspecten = [];;      
            $queryResult = $mysqli->query($queryOverigeAspecten);
            if ($queryResult->num_rows > 0) { // output data of each row         
                while($row = $queryResult->fetch_assoc()) {
                    array_push($overigeAspecten, $row);    
                }
                array_push($messages, " lijst overige aspecten opgehaald");
            }

            // haal de icons gegevns op, zodat de frontend weet welke icons beschikbaar zijn.
            $iconsData = leesFilenames_V2('./images/mebyme_icons', "nameSort" );

        } else 
             array_push($messages, $username . " " . $apikey . " heeft onvoldoende rechten of apikey verlopen");

        $result = [
            // ****** LET OP queryResult is een associative array met een message en de dataArray
            // 'data'          => $data,
            'dataPerAspect'      => $allAspectRows,
            'teTonenAspecten'    => $teTonenAspecten,
            'overigeAspecten'    => $overigeAspecten,
            'teTonenAspectTypes' => $teTonenAspectTypes,
            'iconsData'          => $iconsData,
            'messages'           => $messages
        ];
        return $result;
    }

    function get_period_week($inp) {  // meByme voor bijv overzicht slider  
        
        // startDate, endDate, levert voor iedere week een regel, ook de lege. 
        // uit: [{'week': 24_12 }, [{'dezedag_maxWaarde': 5]}, {{'dezedag_gemWaarde': 3.2], }} ] 

        $mysqli = connect();

        $mysqli->set_charset("utf8mb4");
        $mysqli->query("SET collation_connection = 'utf8mb4_general_ci'");

        $result = $mysqli->query("SHOW VARIABLES LIKE 'collation_connection'");

        // Fetch and display the result
        $collation = $result->fetch_assoc();
        // var_dump('<h5> TEST 845 TEST </h5>');
        // var_dump($collation);
        // var_dump('<h5> TEST 845 stop TEST </h5>');
        $messages  = [];
        $username  = $inp['username']; 
        $apikey    = $inp['apikey'];
        $startDate = $inp['startDate']; // text format
        $endDate   = $inp['endDate'];
        $data = []; 
        $allAspectRows = []; 

        // 1 creer een array voor iedere week

        $data_alleWeken_inPeriode = [];

        function get_weekAndYear($index, $datum) {
            $weekAndYear = [
                'index'     => $index,
                'datum'     => $datum,
                'jaar'      => date('Y', $datum),
                'week'      => date('W', $datum),
                'yearWeek'  => date('Y', $datum) . '_' . date('W', $datum),
                'data'      => []
            ];
            return $weekAndYear;
        }

        function getNextWeekDate($datum) {
            $datum = strtotime("+7days", $datum);
            return $datum;
        }

        function voegToe_aan_data_alleWeken_inPeriode($data_array, $row) {
            // voeg deze row toe de juiste row van Data_alleWeken_inPeriode[]
            
            $yearWeekToFind = $row['jaarWeek']; // or any property of $row you need

            // Filter the data_array to find the matching row
            $filteredRow = array_filter($data_array, function($item) use ($yearWeekToFind) {
                return $item['yearWeek'] == $yearWeekToFind;
            });

            $filteredRow['data']= $row;

            // $filteredRow = array_filter($data_array, function($k) {
            //     var_dump('<h4> 883: row: </h4>');
            //     var_dump($row);
            //     return $k['yearWeek'] == '2024_26';
            // });
                
            // var_dump('<h5> stringify 890 TEST filtered row </h5>');
            // var_dump(json_encode($filteredRow));
            // var_dump('<h5/>');
            
        

            // var_dump('<h5> TEST 890 EINDE TEST </h5>');
            // var_dump('');

             return true;
        }

        // create alle weken leeg 
        $index=0;
        $loopWeek = get_weekAndYear($index, strtotime($startDate)); 
        $loopDate = get_weekAndYear($index, strtotime($startDate)); 
        $endWeek  = get_weekAndYear($index, strtotime($endDate));
        
        array_push($data_alleWeken_inPeriode, $loopWeek);  // er is minimaal een periode van 1 dag
        while ($loopWeek['yearWeek'] <= $endWeek['yearWeek'] && $index<520) { // max 10 jaar
            $loopWeek  = get_weekAndYear($index, getNextWeekDate($loopWeek['datum']));
            array_push($data_alleWeken_inPeriode, $loopWeek);
            $index+=1;
        };

        // var_dump('<h5> 912 912 </h5>');
        foreach ($data_alleWeken_inPeriode as $dataRegel) {
            // echo(json_encode($dataRegel));
            // var_dump('<h5> </h5>');
        }

        //  var_dump('<h5> 917 917 </h5>');

        // var_dump(array_filter($data_alleWeken_inPeriode, function($k) {
        //     return $k['yearWeek'] == '2024_26';
        // }));

        // var_dump('<h5> 917 EINDE 917 </h5>');

            if (apikeyValid($mysqli, $username, $apikey)) {
                $query     = "SELECT * from metaperweek ";
                $query    .= " WHERE username = ? AND jaarWeek >= ? AND jaarWeek <= ? ";
               
                $start_yearWeek_item = get_weekAndYear(0,strtotime($startDate));
                // var_dump('<h5/>');
                // var_dump($start_yearWeek_item);
                // var_dump('<h5/>');

                $end_yearWeek_item = get_weekAndYear(0,strtotime($endDate));
                // var_dump($end_yearWeek_item);
                // var_dump('<h5/>');

                $start_yearWeek = $start_yearWeek_item['yearWeek']; 
                $end_yearWeek = $end_yearWeek_item['yearWeek']; 
             
                // var_dump('<h5> start_yearweek</h5>');
                // echo("$start_yearWeek tot/met $end_yearWeek ");
                // var_dump('<h5/>');                var_dump('<h5/>');
                //$tstQuery  = "SELECT * from metaperweek ";
                //$tstQuery .= " WHERE username = '$username' AND jaarWeek  >=  '$start_yearWeek' AND jaarWeek <='$end_yearWeek'";
                $tstQuery  = "SELECT * FROM metaperweek ";
                $tstQuery .= "WHERE username = '$username' ";
                $tstQuery .= "AND jaarWeek COLLATE utf8mb4_general_ci >= '$start_yearWeek' ";
                $tstQuery .= "AND jaarWeek COLLATE utf8mb4_general_ci <= '$end_yearWeek'";
                
                
                // var_dump($tstQuery);
                // var_dump('<h5/>');      
                // array_push($messages, $tstQuery);
                
                $result = $mysqli->query($tstQuery);

                if ($result === false) {
                    // Output the error message for debugging
                    die('Query failed: ' . htmlspecialchars($mysqli->error));
                } else {
                    // Fetch the results
                    $queryResult = $result->fetch_all(MYSQLI_ASSOC);
                    // var_dump('<h5/>');      
                    // var_dump($data_alleWeken_inPeriode);
                    foreach($queryResult as $row) {
                        // var_dump($row); // Output the results
                        // var_dump('<h5/>');  
                        voegToe_aan_data_alleWeken_inPeriode($data_alleWeken_inPeriode, $row);  
                    }
                    //                 var_dump('<h5/>');
                }
            
            } else 

            array_push($messages, $username . " " . $apikey . " heeft onvoldoende rechten of apikey verlopen");
            var_dump('<h5> test 1 988 </h5>');      
            var_dump($data_alleWeken_inPeriode);
        $result = [
            // ****** LET OP queryResult is een associative array met een message en de dataArray
            'data'                      => $data,
            'data_alleWeken_inPeriode'  => $data_alleWeken_inPeriode,
            'messages'                  => $messages
        ];
        var_dump('<h5> test 2 995 </h5>');      
        var_dump($result['data_alleWeken_inPeriode'] );


        return $result;
    }

   // **********************************************
    //     ASPECTEN (HGH)                ASPECTEN
    // **********************************************
    
    function get_alle_aspecten ($inp, $mode) { // ongeacht user
      
        $mysqli = connect();
        $username = $inp['username']; 
        $resultData = [];   
        $messages = [];
    
        $query =  "SELECT  aspect FROM aspecten";
        $query .= " ORDER BY basicOrder ";

        array_push($messages, $query);

        if ($mode=="test") { 
            var_dump ('<h3> aspecten lijst</h3>');
            var_dump ($query);
        }
        /* Select queries return a resultset */
        $queryResult = $mysqli->query($query);
        if ($queryResult->num_rows > 0) { // output data of each row         
            while($row = $queryResult->fetch_assoc()) {
                array_push($resultData, $row);    
            }
            array_push($messages, " lijst opgehaald:" . strval($queryResult->num_rows) . " regels uit de database opgehaald");
        }

        $result = [
            // ****** LET OP queryResult is een associative array met een message en de dataArray
            'resultData' => $resultData,
            'messages'   => $messages
        ];
        return $result;
    }


    function get_data_1_aspect($inp, $mode) { // alleen van aspect!
      
        $mysqli     = connect();
        $username   = $inp['username']; 
        $aspectNaam = $inp['aspectNaam'];
        $resultData = [];   
        $messages   = [];
    
        // check if user has rights ... nog niet gebouwd

        $query =  "SELECT * FROM aspecten WHERE aspect = '$aspectNaam'";
        array_push($messages, $query);
        $queryResult = $mysqli->query($query);
        if ($queryResult->num_rows > 0) { // output data of each row         
            while($row = $queryResult->fetch_assoc()) { array_push($resultData, $row); }
            array_push($messages, " lijst opgehaald:" . strval($queryResult->num_rows) . " regels uit de database opgehaald");
        }

        $result = [
            // ****** LET OP queryResult is een associative array met een message en de dataArray
            'resultData'   => $resultData,
            'messages'     => $messages
        ];
        return $result;
    }

    function update_AspectData($inp, $mode) { // alleen een specifiek aspect, los van user dus!
      
        $mysqli = connect();
           
        $username = $inp['username']; 
        $aspect   = $inp['select_aspectBeheer'];

        $resultData = [];   
        $message = "";
        $messages = [];

        $edit_aspect_kleur   = $inp['edit_aspect_kleur'];

        // check if user has rights ...
         
        $query =  "UPDATE aspecten SET kleurInApp = ? WHERE aspect = '$aspect' ";

        $query1 =  "UPDATE aspecten SET kleurInApp = $edit_aspect_kleur WHERE aspect = '$aspect' ";


        array_push($messages, $query1);
        if ($mode=="test") { echo ($query); }
        $stmt = $mysqli->prepare($query);
        $stmt->bind_param("s", $edit_aspect_kleur);

        if ($stmt->execute() === true) {
            array_push($messages, "$aspect kleur, $edit_aspect_kleur aagepast door $username");
        } else {
            array_push($messages, "FOUT in updaten $aspect kleur, $edit_aspect_kleur aagepast door $username");
        }
        

        $result = [
            'query'    => $query1,
            'messages'  => $messages
        ];
        return $result;
    }

    // *****************************************************************************************
    //     Haal Aspecten
    // *****************************************************************************************

    function get_aspectLijsten_user($inp) { // 
        // geeft 2 lijsten terug alle gekoppelde aspecten, en te koppelen aspecten
        $mysqli = connect();
        $messages = [];
        $username = $inp['username']; 

        $gekoppelde_aspecten = []; 
        $te_koppelen_aspecten = [];
       
        if (apikeyValid($mysqli, $username, $inp['apikey'])) {
            $query  = "SELECT orderInList, aspect, kleurInApp, bijInvoerTonen, inOverzichtTonen ";
            // $query .= " FROM aspect_settings_per_user WHERE username = ? ";
            $query .= " FROM aspect_info WHERE username = ? ";
            
            $queryTst  = "SELECT orderInList, aspect, , kleurInApp, bijInvoerTonen, inOverzichtTonen ";
            $queryTst .= " FROM aspectInfo WHERE username = '$username' ";
            
            array_push($messages, $queryTst);
             // echo ($query); 
            
            $stmt = $mysqli->prepare($query);
            $stmt->bind_param("s", $username);

            if ($stmt->execute() === true) {
                $queryResult = $stmt->get_result();

                while($row = $queryResult->fetch_assoc()) {
                    array_push($gekoppelde_aspecten, $row);    
                }
            }

            // de nog niet gekoppede aspecten

            // voorbeeld: 
            // SELECT * FROM `aspect_settings_per_user` WHERE not username = 'guest' 
            // AND aspect NOT IN (SELECT aspect from aspect_settings_per_user WHERE username = 'guest') 
            
            $query  = "SELECT aspect FROM aspecten WHERE aspect NOT IN ";
            $query .= " (SELECT aspect from aspect_settings_per_user WHERE username = ?) ";

            $queryTst  = "SELECT aspect FROM aspecten WHERE aspect NOT IN ";
            $queryTst .= " (SELECT aspect from aspect_settings_per_user WHERE username =  '$username') ";

            array_push($messages, $queryTst);
            // echo ($query); 

            $stmt = $mysqli->prepare($query);
            $stmt->bind_param("s", $username);
            if ($stmt->execute() === true) {
                $queryResult = $stmt->get_result();
                while($row = $queryResult->fetch_assoc()) {
                    array_push($te_koppelen_aspecten, $row);    
                }
                array_push($messages, " Nog te koppelen aspecten: " . strval($queryResult->num_rows) . " regels uit de database opgehaald");
            } 
        } else {
            array_push($messages, " apikey: " . $inp['apikey'] . ' is niet geldig voor ' . $username ) ;
        }

        $result = [
            // ****** LET OP queryResult is een associative array met een message en de dataArray
            'gekoppelde_aspecten'  => $gekoppelde_aspecten,
            'te_koppelen_aspecten' => $te_koppelen_aspecten,
            'messages'               => $messages
        ];
        return $result;
    }

    //     Haal gegevens  van 1 aspect an een user 
    
    function get_user_settings_1_aspect($inp, $mode) { // settings van 1 aspect van een user
      
        $mysqli      = connect();
        $username    = $inp['username']; 
        $aspect      = $inp['aspect'];
        $resultData  = [];   
        $messages    = [];
    
        if (apikeyValid($mysqli, $username, $inp['apikey'])) {
            $query = "SELECT * FROM aspect_settings_per_user WHERE username = '$username' AND aspect = '$aspect' AND deleted = false ";
            array_push($messages, $query);
            if ($mode=="test") { echo ($query); }

            $queryResult = $mysqli->query($query);
            if ($queryResult->num_rows > 0) { // output data of each row         
                while($row = $queryResult->fetch_assoc()) { array_push($resultData, $row); }
                array_push($messages, " lijst opgehaald:" . strval($queryResult->num_rows) . " regels uit de database opgehaald");
            }
        } else {
            array_push($messages, " apikey: " . $inp['apikey'] . ' is niet geldig voor ' . $username ) ;
        }


        $result = [
            // ****** LET OP queryResult is een associative array met een message en de dataArray
            'resultData'   => $resultData,
            'query'        => $query,
            'messages'     => $messages
        ];
        return $result;
    }

    function update_User_1AspectData($inp, $mode) { // alleen van 1 aspect van 1 user!
              
        $mysqli = connect();
           
        $username            = $inp['username']; 
        $for_user            = $inp['for_user']; 
        $aspect              = $inp['aspect'];
        $orderInList         = $inp['orderInList'];
        $bijInvoerTonen      = $inp['bijInvoerTonen'];
        $inOverzichtTonen    = $inp['inOverzichtTonen'];

        $resultData = [];   
        $messages = [];

        // update data in de tabel aspect_settings_per_user

        $query =  "UPDATE aspect_settings_per_user SET orderInList = ?, bijInvoerTonen = ?, inOverzichtTonen = ? ";
        $query .= " WHERE aspect = ? AND username = ? ";
        
        $queryTst =  "UPDATE aspect_settings_per_user ";
        $queryTst .= " SET orderInList = $orderInList, bijInvoerTonen = '$bijInvoerTonen', inOverzichtTonen = '$inOverzichtTonen' ";
        $queryTst .= " WHERE aspect = '$aspect' AND username = '$username' ";
        array_push($messages, $queryTst);

        $stmt = $mysqli->prepare($query);
        $stmt->bind_param("sssss", $orderInList, $bijInvoerTonen, $inOverzichtTonen, $aspect, $for_user);
        if ($stmt->execute() === true) {
            if ($mysqli->affected_rows >0) {
                array_push($messages, "aspectgegevens: $aspect: ,  aangepast voor $for_user");
            } else {                
                array_push($messages, "aspectgegevens: $aspect: ,  NIET aangepast, geen wijzigingen of niet gevonden" );
            }
        } else {
            array_push($messages, "FOUT in DB aspectgegevens: $aspect, NIET aangepast voor $for_user"); 
        }
        array_push($messages, $query);


        $result = [
            'messages'  => $messages
        ];
        return $result;
    }

    function update_or_create_hgh_waarneming($inp, $mode) { // mebyme
     
        $mysqli = connect();
           
        $username   = $inp['username']; 
        $aspect     = $inp['aspect'];
        $datum      = $inp['datum'];
        $waarde     = $inp['waarde'];       
        $opmerking  = $inp['opmerking'];

        $resultData = [];   
        $messages = [];
        $mainMessage = "nog niets kunnen aanpassen";

        if (apikeyValid($mysqli, $username, $inp['apikey'] )) {

            $queryCheckAspect  = "SELECT * FROM hoegaathet "; 
            $queryCheckAspect .= " WHERE username = ?  AND aspect= ? AND datum = ? " ;

            $stmt1= $mysqli->prepare($queryCheckAspect);
            $stmt1->bind_param("sss", $username, $aspect, $datum);
            
            if ($stmt1->execute() === true) { 
                $queryResult = $stmt1->get_result();
                
                if ($queryResult->num_rows === 1 ) { // meting HGH van aspect op deze datum BESTAAT EN KAN WORDEN AAGEPAST
                    array_push($messages, "$aspect bestaat op $datum ");
                
                    // UPDATE waarde  de tabel hoegaathet
                    
                    $query =  "UPDATE hoegaathet SET waarde = ?, opmerking = ?" ; // wijzigDdatumTijd = ?
                    $query .= " WHERE username = ?  AND aspect = ? AND datum = ? " ;
                
                    $queryTst = "UPDATE hoegaathet SET waarde = $waarde, opmerking = '$opmerking'";
                    $queryTst .=" WHERE username = '$username' AND aspect = '$aspect' AND datum = '$datum' " ;

                    array_push($messages, $queryTst);

                    //var_dump($queryTst);

                    $stmt2 = $mysqli->prepare($query);
                    $stmt2->bind_param("sssss", $waarde, $opmerking, $username, $aspect, $datum);
                    if ($stmt2->execute() === true) {
                        if ($mysqli->affected_rows >0) {
                            array_push($messages, "nieuwe waarde: $waarde en/of opmerking $opmerking aangepast voor aspect: $aspect op $datum");
                            $mainMessage = "nieuwe waarde: $waarde en/of opmerking $opmerking , aangepast voor aspect: $aspect op $datum";
                        } else {                
                            array_push($messages, "waarde en opmerking van: $aspect op $datum NIET aangepast, waardes waarschijnlijk niet gewijzigd" );
                            $mainMessage = "waarde en opmerking van: $aspect op $datum is NIET aangepast voor $aspect";
                        }
                    } else {
                        array_push($messages, "FOUT in API/DB waarde en opmerking van: $aspect op $datum is NIET aangepast voor $aspect");
                    }

                } else { // een waarmneming van aspect op deze datum BESTAAT NOG NIET EN MOET WORDEN TOEGEVOEGD
                    
                    $query =  "INSERT INTO hoegaathet (username, datum, aspect, waarde, opmerking) ";
                    // geen bind_param want wordt alleen door systeem zelf aangevraagd, met de juiste credentials!
                    $query .= " VALUES('$username', '$datum', '$aspect', '$waarde', '$opmerking') " ;
                    
                    var_dump($query);

                    $queryResult = $mysqli->query($query);
        
                    if ($queryResult === TRUE) {
                        array_push($messages, "nieuwe waarneming: toegevoegd voor $aspect op $datum"); 
                        $mainMessage = $messages[count($messages)-1]; // laatste message
                    } else {
                        array_push($messages, "FOUT in API/DB waarde: $nieuwe waarneming toegevoegd op $datum voor $aspect"); 
                        $mainMessage = $messages[count($messages)-1]; // laatste message
                    }
                }
            } else {
                array_push($messages, "FOUT in API/DB aspect: meting NIET aangepast voor $aspect");
                $mainMessage = "waarde en opmerking niet kunnen aanpassen, fout in aanvraag" ;
            }
        
        } else { 
            array_push($messages, "geen toegang, foute apikey voor: $$username");
        }
            
        $result = [
            'mainMessage'  => $mainMessage,
            'messages'     => $messages
        ];
        return $result;
    }

    // mebyme 
    function update_of_insert_waarde_1aspect($inp, $mode) { // alleen van 1 aspect van 1 user! --> mebyme
              
        $mysqli = connect();
           
        $username            = $inp['username']; 
        $aspect              = $inp['aspect'];
        $datum               = $inp['datum'];
        $waarde              = $inp['waarde'];

        $resultData = [];   
        $messages = [];
        $mainMessage = "waarde niet kunnen aanpassen";

        // check eerst of dit aspect voor deze user op deze datum al bestaat, 
        // - zo ja, dan aanpassen
        // - zo nee, dan nieuwe invoegen

        $queryCheckAspect  = "select waarde FROM hoegaathet "; // wijzigDdatumTijd = ?
        $queryCheckAspect .= " WHERE username = ?  AND aspect= ? AND datum = ?" ;

        $queryCheckAspectTst  = "select COUNT(*) FROM hoegaathet "; // wijzigDdatumTijd = ?
        $queryCheckAspectTst .= " WHERE username = '$username'  AND aspect='$aspect' AND datum = '$datum'" ;

        array_push($messages, $queryCheckAspectTst);

        $stmt1= $mysqli->prepare($queryCheckAspect);
        $stmt1->bind_param("sss", $username, $aspect, $datum);

        
        if ($stmt1->execute() === true) { 
            $queryResult = $stmt1->get_result();
            
            if ($queryResult->num_rows === 1 ) { // WAARDE van aspect op deze datum BESTAAT EN KAN WORDEN AAGEPAST
                array_push($messages, "$aspect bestaat op $datum ");
               
                // UPDATE waarde  de tabel hoegaathet
                
                $query =  "UPDATE hoegaathet SET waarde = ?"; // wijzigDdatumTijd = ?
                $query .= " WHERE username = ?  AND aspect = ? AND datum = ? " ;
                
                $queryTst = "UPDATE hoegaathet SET waarde = $waarde ";
                $queryTst .=" WHERE username = '$username' AND aspect = '$aspect' AND datum = '$datum' " ;


                array_push($messages, $queryTst);

                // var_dump($queryTst);

                $stmt2 = $mysqli->prepare($query);
                $stmt2->bind_param("ssss", $waarde, $username, $aspect, $datum);
                if ($stmt2->execute() === true) {
                    if ($mysqli->affected_rows >0) {
                        array_push($messages, "nieuwe waarde: $waarde: ,  aangepast voor aspect: $aspect");
                        $mainMessage = "nieuwe waarde: $waarde: ,  is aangepast voor aspect: $aspect op $datum";
                    } else {                
                        array_push($messages, "waarde van: $aspect op $datum is NIET aangepast, waarde was niet veranderd, of niet gevonden" );
                        $mainMessage = "waarde van: $aspect op $datum is NIET aangepast, waarde was waarschijnlijk al $waarde" ;
                    }
                } else {
                    array_push($messages, "FOUT in API/DB waarde: $waarde, NIET aangepast voor $aspect"); 
                }

            } else { // WAARDE van aspect op deze datum BESTAAT NOG NIET EN MOET WORDEN TOEGEVOEGD
                 
                $query =  "INSERT INTO hoegaathet (username, datum, aspect, waarde) ";
                // geen bind_param want wordt alleen door systeem zelf aangevraagd, met de juiste credentials!
                $query .= "VALUES('$username', '$datum', '$aspect', '$waarde')" ;
                
                // var_dump($query);

                $queryResult = $mysqli->query($query);
    
                if ($queryResult === TRUE) {
                    array_push($messages, "nieuwe waarde: $waarde aangepast/toegevoegd voor $aspect op $datum"); 
                    $mainMessage = "nieuwe waarde: $waarde aangepast/toegevoegd voor $aspect op $datum";
                } else {
                    array_push($messages, "FOUT in API/DB waarde: $waarde, NIET toegevoegd op $datum voor $aspect"); 
                    $mainMessage = "nieuwe waarde: $waarde NIET aangepast/toegevoegd voor $aspect op $datum onbekende fout in DB";
                }
            }
        } else {
            array_push($messages, "FOUT in API/DB aspect: $waarde, NIET aangepast voor $aspect");
            $mainMessage = "waarde niet kunnen aanpassen, fout in aanvraag" ;
        }
            
        $result = [
            'mainMessage'  => $mainMessage,
            'messages'     => $messages
        ];
        return $result;
    }

    function update_opmerking_1aspect($inp, $mode) { // alleen van 1 aspect van 1 user! --> mebyme
              
        // Een opmerking kan alleen aangepast worden van een bestaande regel (waarneming) in de hoegaathet tabel
        
        $mysqli = connect();
           
        $username            = $inp['username']; 
        $aspect              = $inp['aspect'];
        $datum               = $inp['datum'];
        $opmerking           = $inp['opmerking'];

        $resultData = [];   
        $messages = [];
        $mainMessage = "opmerking niet kunnen aanpassen";

        if (apikeyValid($mysqli, $username, $inp['apikey'] )) {

            // Check of op deze dag al een waarneming in de tabel hoe gaat het staat (deze user, dit Aspect)
            
            // UPDATE opmerking in  de tabel hoegaathet
           
            



            $query =  "UPDATE hoegaathet SET opmerking = ?"; // wijzigDdatumTijd = ?
            $query .= " WHERE username = ?  AND aspect = ? AND datum = ? " ;
            
            $queryTst = "UPDATE hoegaathet SET  opmerking= $ opmerking ";
            $queryTst .=" WHERE username = '$username' AND aspect = '$aspect' AND datum = '$datum' " ;


            array_push($messages, $queryTst);

            // var_dump($queryTst);

            $stmt = $mysqli->prepare($query);
            $stmt->bind_param("ssss", $opmerking, $username, $aspect, $datum);
            if ($stmt->execute() === true) {
                if ($mysqli->affected_rows >0) {
                    array_push($messages, "opmerking: $opmerking: ,  aangepast voor aspect: $aspect");
                    $mainMessage = "opmerking: $opmerking: ,  is aangepast voor aspect: $aspect op $datum";
                } else {                
                    array_push($messages, "opmerking van: $aspect op $datum is NIET aangepast, opmerking was niet veranderd, of niet gevonden" );
                    $mainMessage = "opmerking van: $aspect op $datum is NIET aangepast, opmerking was waarschijnlijk al $opmerking" ;
                }
            } else {
                array_push($messages, "FOUT in API/DB, de opmerking: $opmerking op $datum, is NIET aangepast voor $aspect"); 
            }

        } else { 
            array_push($messages, "geen data, foute apikey voor: $api_aanvrager");
        }
            
        $result = [
            'mainMessage'  => $mainMessage,
            'messages'     => $messages
        ];
        return $result;
    }

    function update_aspect_bijInvoerTonen_1User($inp, $mode) { // alleen van 1 aspect van 1 user! --> mebyme
              
        $mysqli = connect();
           
        $username            = $inp['username']; 
        //$for_user            = $inp['for_user']; 
        $aspect              = $inp['aspect'];
        $bijInvoerTonen      = $inp['bijInvoerTonen'];
        //$inOverzichtTonen    = $inp['inOverzichtTonen'];

        if (apikeyValid($mysqli, $username, $inp['apikey'])) {

            $resultData = [];   
            $messages = [];

            // update data in de tabel aspect_settings_per_user

            $query =  "UPDATE aspect_settings_per_user SET bijInvoerTonen = ?";
            $query .= " WHERE aspect = ? AND username = ? ";
            
            $queryTst =  "UPDATE aspect_settings_per_user ";
            $queryTst .= " SET bijInvoerTonen = '$bijInvoerTonen' ";
            $queryTst .= " WHERE aspect = '$aspect' AND username = '$username' ";
            array_push($messages, $queryTst);

            $stmt = $mysqli->prepare($query);
            $stmt->bind_param("sss", $bijInvoerTonen,$aspect, $username);
            if ($stmt->execute() === true) {
                if ($mysqli->affected_rows >0) {
                    array_push($messages, "aspectSettings: $aspect: ,  aangepast voor $username");
                } else {                
                    array_push($messages, "aspectSettings: $aspect: ,  NIET aangepast, geen wijzigingen of niet gevonden" );
                }
            } else {
                array_push($messages, "FOUT in DB aspectSettings: $aspect, NIET aangepast voor $username"); 
            }
            array_push($messages, $query);

        } else {
            array_push($messages, " apikey: " . $inp['apikey'] . ' is niet geldig voor ' . $username ) ;
        }


        $result = [
            'messages'  => $messages
        ];
        return $result;
    }

    function koppel_aspect_aan_1user( $inp, $mode ) { // mebyme
        // Dit aspect koppelen aan de user in de tabel aspect_settings_per_user
        // 1) check of dit aspect al gekoppeld is 
        // 2a) Maak regel aan in aspecten_settings_per_user 

      $mysqli = connect();
  
      $username     = $inp['username']; 
      $for_user     = $inp['username'];    // eventueel kan een admin koppelen voor een user. Dan aanpassen     
      $apikey       = $inp['apikey']; 
      $aspect       = $inp['aspect'];      // deze moet al bestaan
           

      $resultData = [];   
      $messages = [];
      $userMessage = "Koppeling $aspect aan $for_user niet uitgevoerd";
  
      if (apikeyValid($mysqli, $username, $inp['apikey'])) {

          // check if it allready existst for for_user ....
            $query =  "SELECT * FROM aspect_settings_per_user WHERE aspect= '$aspect' AND username='$for_user'";
            array_push($messages, $query);
            $queryResult = $mysqli->query($query);
            if ($queryResult->num_rows > 0) { // output data of each row         
                array_push($messages, "$aspect niet toegevoegd aan aspect_settings_per_user, want is daar al gekoppeld");
            } else {
                // haal aspect_type op om de sliderRij= volgorde van aspecten te bepalen, komt aan het einde van aspectType
                 
                $query =  "SELECT aspect_type FROM `aspecten` WHERE aspect='$aspect' ";
                array_push($messages, $query);
                $queryResult = $mysqli->query($query);
                $resultRow = $queryResult->fetch_assoc();
                $aspect_type = $resultRow['aspect_type'];
                
                $query =  "SELECT max(sliderRij) as sliderRijMax FROM `aspect_settings_per_user_view` WHERE username='$for_user' AND aspect_type='$aspect_type'";
                array_push($messages, $query);
                $queryResult = $mysqli->query($query);

                if ($queryResult->num_rows > 0) { // output data of each row         
                    $resultRow = $queryResult->fetch_assoc();
                    $sliderRijMax = $resultRow['sliderRijMax'] + 5 ;
                } else 
                    $sliderRijMax=999;
                
                array_push($messages, " sliderRijMax:" . $sliderRijMax);
                                
               
                $query =  "INSERT INTO aspect_settings_per_user ( username, aspect, sliderRij, bijInvoerTonen )";
                $query .= " VALUES( '$for_user', '$aspect', $sliderRijMax, 'ja') " ;
                array_push($messages,$query);
                
                $queryResult = $mysqli->query($query);

                if ($queryResult === true) {
                    array_push($messages, "$aspect,  gekoppeld met '$for_user' ");
                    $userMessage = "Koppeling $aspect aan $for_user uitgevoerd, aspect_type: $aspect_type, sliderRijMax(volgorde): getType($sliderRijMax) " ;
                } else {
                    array_push($messages, "Onbekende FOUT ->  $aspect, NIET gekoppeld met  $for_user"); 
                }
                
            } 
        
           } else {
            array_push($messages, " apikey: " . $inp['apikey'] . ' is niet geldig voor ' . $username ) ;
        }

        
        $result = [
            'messages'    => $messages,
            'userMessage' => $userMessage
        ];
        return $result;
    }

    function koppel_aspect_aan_user( $inp, $mode ) { // originele versie niet mebyme
        // Dit aspect koppelen aan de user.
        // 1) check of dit aspect al gekoppeld is 
        // 2a) Maak regel aan in aspecten_settings_per_user 

      $mysqli = connect();
  
      $username  = $inp['username']; 
      $for_user  = $inp['for_user'];  // eventueel kan een admin koppelen voor een user.      
      $apikey    = $inp['apikey']; 
      $aspect    = $inp['aspect'];
      

      $resultData = [];   
      $messages = [];
      $userMessage = "Koppeling $aspect aan $for_user niet uitgevoerd";
  
      // check if username has rights ... check if it allready existst for for_user ....

      $query =  "SELECT * FROM aspect_settings_per_user WHERE aspect= '$aspect' AND username='$for_user'";
      $queryResult = $mysqli->query($query);
      if ($queryResult->num_rows > 0) { // output data of each row         
          array_push($messages, "$aspect niet toegevoegd aan aspect_settings_per_user, want is daar al gekoppeld");
      } else {
          $query =  "INSERT INTO aspect_settings_per_user (username, aspect)";
          $query .= "VALUES('$for_user', '$aspect')" ;
          $queryResult = $mysqli->query($query);

          if ($queryResult === true) {
              array_push($messages, "$aspect,  gekoppeld met '$for_user' ");
              $userMessage = "Koppeling $aspect aan $for_user uitgevoerd";
          } else {
              array_push($messages, "Onbekende FOUT ->  $aspect, NIET gekoppeld met  $for_user"); 
          }
      } 

      $result = [
          'query'       => $query,
          'messages'    => $messages,
          'userMessage' => $userMessage
      ];
      return $result;
    }

    function insert_aspect($inp, $mode) { // alleen een aspect!
      
        $mysqli = connect();
        $naam =         

        $aspect         = $inp['new_aspect'];
        $aspect_kleur   = $inp['aspect_kleur'];

        $resultData = [];   
        $message = "";
        $messages = [];
    
        // check if user has rights ...

        // check if it allready existst

        $query =  "SELECT distinct aspect FROM aspecten WHERE aspect = '$aspect'";
        $queryResult = $mysqli->query($query);
        
        if ($queryResult->num_rows > 0) { // output data of each row         
            array_push($messages,"$aspect niet toegevoegd, want staat al in de database ");
        } else {

            $query1 =  "INSERT INTO aspecten (aspect, kleurInApp) ";
            $query1 .= "VALUES('$aspect', '$aspect_kleur')" ;

            $queryResult = $mysqli->query($query1);

            if ($queryResult === TRUE) {
                array_push( $messages, $query1);
                array_push( $messages, " aspect kleur $aspect_kleur in aspect_setting ingevoerd: $aspect, ingevoerd ");
            } else {      
                array_push($messages,"insert INTO aspecten niet gelukt"); 
            }
        }   

        $result = [
            'messages'  => $messages
        ];
        return $result;
    }
    

    function get_meta_accounts_1($inp, $modus) { // mebyme 
        
        // in: 'username_aanvrager, api_aanvrager

        $messages       = [];
        $user_info      = [];
        $row_aanvrager  = [];

        $inp_ok = true;
        if (array_key_exists('username_aanvrager', $inp))  $username_aanvrager  = $inp['username_aanvrager']; else { $inp_ok=false; array_push ($messages, 'username_aanvrager niet gevonden');}
        if (array_key_exists('api_aanvrager', $inp))       $api_aanvrager       = $inp['api_aanvrager'];      else { $inp_ok=false; array_push ($messages, 'api_aanvrager niet gevonden');}
         
        if ($inp_ok==true) {

            $mysqli = connect();

            if (apikeyValid($mysqli, $username_aanvrager, $api_aanvrager)) {
     
                if ( admin_rights($mysqli, $username_aanvrager, $api_aanvrager ) )  {
                    $query = "SELECT * FROM meta_user_compact "; // geef meta info van alle users
                } else { // ******* GEEN ADMIN RIGHTS  ******* 
                    $query = "SELECT * FROM meta_user_compact WHERE username = '$username_aanvrager' "; // geef meta info van alle users
                }  
                array_push($messages, $query);

                $queryResult = $mysqli->query($query);
                
                if ($queryResult->num_rows > 0) {   // de aanvrager is bekend  
                    // $row_aanvrager = $queryResult->fetch_assoc();

                    while($row = $queryResult->fetch_assoc()) {
                     
                        array_push($user_info, $row);    
                    }

                }
                  
            } else { 
                array_push($messages, "geen data, foute apikey voor: $api_aanvrager");
            }

        } else {
            array_push($messages,'geen (username, apikey) van aanvrager meegeleverd, kan geen vragen aan de database stellen');
        }

        $result = [
            'username_aanvrager'    => $username_aanvrager, 
            'user_info'             => $user_info,
            'messages'              => $messages,
            'resultMessage'         => $messages[0]
        ];

        return $result;
    }

    function get_meta_accounts_compact($inp, $modus) {
        
        // in: 'username_aanvrager, api_aanvrager

        $messages       = [];
        $users          = [];
        $user_info      = [];
        $row_aanvrager  = [];

        $inp_ok = true;
        if (array_key_exists('username_aanvrager', $inp))  $username_aanvrager  = $inp['username_aanvrager']; else { $inp_ok=false; array_push ($messages, 'username_aanvrager niet gevonden');}
        if (array_key_exists('api_aanvrager', $inp))       $api_aanvrager       = $inp['api_aanvrager'];      else { $inp_ok=false; array_push ($messages, 'api_aanvrager niet gevonden');}
         
        if ($inp_ok==true) {

            $mysqli = connect();

            // bestaat de aanvrager, 

            // $query = "SELECT username, role, apikey, expire FROM users WHERE username = '$username_aanvrager'" ;
            $query = "SELECT * FROM meta_user_1 WHERE username = '$username_aanvrager' ";
            $queryResult = $mysqli->query($query);
        
            if ($queryResult->num_rows > 0) {   // de aanvrager is bekend  
                $row_aanvrager = $queryResult->fetch_assoc();
                $user_info = $row_aanvrager;

                if ($row_aanvrager['role']=="A") { 
                    if ($row_aanvrager['apikey']==$api_aanvrager )  {  // Ja de aanvrager is Admin en heeft de juiste API key 
                        $query = "SELECT * FROM meta_userinfo_compact ";
                        if ($modus == 'test') {
                            var_dump ("837: __");
                            var_dump ($query);
                            var_dump ("__");
                        }
                        $queryResult = $mysqli->query($query);
                        while($row = $queryResult->fetch_assoc()) {
                            if ($modus == 'test') {
                                var_dump ("845: __");
                                var_dump ($row);
                                var_dump ("_____________");
                            }
                            array_push($users, $row);    
                        }
                        array_push($messages, " Er zijn " . strval($queryResult->num_rows) . " rijen uit de database gehaald");
                        if ($modus == 'test') {
                            var_dump ("854: __");
                            var_dump ($messages);
                            var_dump ("__");
                        };
                        
                    } else {
                        array_push($messages, "geen userlijst, foute apikey: $api_aanvrager");
                    }
                } else {
                    array_push($messages, "geen userlijst: $username_aanvrager onvoldoende rechten");
                }
            
            } else { // de aanvrager is onbekend. 
                array_push($messages, "aanvrager $username_aanvrager komt niet voor in de database");
            }
        } else {
            array_push($messages,'geen gegevens (username, apikey) van aanvrager meegeleverd, kan geen vragen aan de database stellen');
        }

        $result = [
            'users'         => $users, 
            'user_info'     => $row_aanvrager,
            'messages'      => $messages,
            'resultMessage' => $messages[0]
        ];

        return $result;
    }

    function get_account_bestaat($username_concept) {
        $mysqli = connect();
        // bestaat de user (username_concept) al?
        $query = "SELECT username FROM users WHERE username = '$username_concept'";
        $queryResult = $mysqli->query($query);
        return ($queryResult->num_rows > 0) ;
    }

    function get_account_status($inp) {
        
        $messages = [];
        if (array_key_exists('username_aanvrager', $inp))  $username_aanvrager  = $inp['username_aanvrager']; else { $inp_ok=false; array_push ($messages, 'username_aanvrager niet gevonden');}
        if (array_key_exists('api_aanvrager', $inp))       $api_aanvrager       = $inp['api_aanvrager'];      else { $inp_ok=false; array_push ($messages, 'api_aanvrager niet gevonden');}
        if (array_key_exists('username_concept', $inp))    $username_concept    = $inp['username_concept'];   else { $inp_ok=false; array_push ($messages, 'username_concept niet gevonden');}

        $mysqli = connect();
        $accountStatus   = [];

        // bestaat de user (username_concept) al?
        $query = "SELECT * FROM users WHERE username = '$username_concept'";
        $queryResult = $mysqli->query($query);
        $userBestaat = false;
        if ($queryResult->num_rows > 0) $userBestaat = true; 

        // wie is de aanvrager Admin? of dezelfde als username_concept (eigenaar?

        $query = "SELECT * FROM users WHERE username = '$username_aanvrager' AND apikey = '$api_aanvrager' ";
        $queryResult = $mysqli->query($query);
     

        if ($queryResult->num_rows > 0) {   // de aanvrager is bekend en API klopt 
            $row = $queryResult->fetch_assoc();
            $rol_aanvrager = $row['role'];

            if ($row['role'] == "A" || strcmp($username_concept, $username_aanvrager)==0 )  {  // JA de aanvrager Admin of dezelfde als username_concept (eigenaar)
                $accountStatus = [ // default instellingen
                    'aanvrager'             => $username_aanvrager,
                    'api_aanvrager'         => $api_aanvrager,
                    'rol_aanvrager'         => $rol_aanvrager,
                    'username_concept'      => $username_concept,
                    'user_bestaat'          => $userBestaat,
                    'apikey_expired'        => true,
                    'settings_bestaan'      => false,  // check alleen op medicijn settings...
                    'med_aantal'            => 0,
                    'inname_aantal'         => 0,
                    'inname_laatste_datum'  => date('Y-m-d', strtotime('-2 year')),
                    'aspect_aantal'         => 0,
                    'aspect_laatste_datum'  => date('Y-m-d', strtotime('-2 year'))
                ];
        
                $query = "SELECT * FROM medicijn_settings_per_user WHERE username = '$username_concept'";
                $queryResult = $mysqli->query($query);
                if ($queryResult->num_rows > 0) {       
                    $accountStatus['settings_bestaan'] = true;
                }
    
                $query = "SELECT count(*) as aantal FROM inname WHERE username = '$username_concept'";
                $queryResult = $mysqli->query($query);
                if ($queryResult->num_rows > 0) {       
                    $row = $queryResult->fetch_assoc();
                    $accountStatus['inname_aantal'] = $row['aantal'];
                }
                
                $query = "SELECT count(*) as aantal FROM hoegaathet WHERE username = '$username_concept'";
                $queryResult = $mysqli->query($query);
                if ($queryResult->num_rows > 0) {     
                    $row = $queryResult->fetch_assoc();  
                    $accountStatus['aspect_aantal'] = $row['aantal'];
                }
                
            } else {
                $accountStatus = [ 
                    'aanvrager'        => $username_aanvrager,
                    'api_aanvrager'    => $api_aanvrager,
                    'rol_aanvrager'    => $rol_aanvrager,
                    'username_concept' => $username_concept,
                    'user_bestaat'     => $userBestaat
                ];
            }    
        
        } else { // de aanvrager is onbekend. 
            $accountStatus = [ 
                'aanvrager'        => $username_aanvrager,
                'api_aanvrager'    => $api_aanvrager,
                'username_concept' => $username_concept,
                'user_bestaat'     => $userBestaat
            ];
        }

        $result = [
            'accountStatus' => $accountStatus, 
            'messages'      => $messages
        ];

        return $result;
    }
    
    function remove_account($inp, $mode) {
        $inp_ok = true;
        $removed = false;
        $messages = [];
        $userMessage = "";
        // array_push( $messages, "remove_account: inp: "  . json_decode($inp) );

        $mysqli = connect();

        if (array_key_exists('username_aanvrager', $inp))  $username_aanvrager  = $inp['username_aanvrager'];  else { $inp_ok=false; array_push ($messages, 'username_aanvrager niet gevonden in de input');}
        if (array_key_exists('api_aanvrager', $inp))       $api_aanvrager       = $inp['api_aanvrager'];       else { $inp_ok=false; array_push ($messages, 'api_aanvrager niet gevonden in de input');}
        if (array_key_exists('username_to_remove', $inp))  $username_to_remove  = $inp['username_to_remove'];  else { $inp_ok=false; array_push ($messages, 'username_to_remove niet gevonden in de input');}
     
        if ($inp_ok == true) { 

            array_push( $messages,  $username_aanvrager . " " . $username_to_remove  );

            if (admin_rights($mysqli, $username_aanvrager, $api_aanvrager ) OR strcmp( $username_aanvrager, $username_to_remove) == 0)  {
             
                // var_dump('+++++++++  rights  ++++++++++');
                // je mag deze user proberen te verwijderen, mits geem metingen of HGH data

                $aantal_innames    = 1; 
                $aantal_hoegaathet = 1;

                // stap 1 kijk of er 0 metingen in staan..
                 
                $query = "SELECT * FROM meta_userinfo WHERE username = '$username_to_remove'";
                array_push( $messages, "query1: $query" );
                       
                $queryResult = $mysqli->query($query);
                if ($queryResult->num_rows > 0) {       
                    $row = $queryResult->fetch_assoc();

                    if ($row['role'] =='A') {
                        array_push( $messages, "Kan geen account met adminrechten verwijderen");
                    } else {


                        $aantal_innames    = $row['aantal_innames'];
                        $aantal_hoegaathet = $row['aantal_hoegaathet'];

                        if ($aantal_innames == 0 && $aantal_hoegaathet == 0 ) {
                            array_push( $messages, "$username_to_remove heeft geen metingen, kan dus verwijderd worden" );
                            
                            // ********* remove the account  ******** 
        
                            $query = "DELETE FROM medicijn_settings_per_user  WHERE username = ?";
                            $stmt = $mysqli->prepare($query);
                            $stmt->bind_param("s", $username_to_remove);    
                            if ($stmt->execute() === true) array_push( $messages, "query1: $query" );
                            
                            $query = "DELETE FROM medicijn_soorten_settings_per_user  WHERE username = ?";
                            $stmt = $mysqli->prepare($query);
                            $stmt->bind_param("s", $username_to_remove);    
                            if ($stmt->execute() === true) array_push( $messages, "query2: $query" );
                              
                            $query = "DELETE FROM aspect_settings_per_user  WHERE username = ?";
                            $stmt = $mysqli->prepare($query);
                            $stmt->bind_param("s", $username_to_remove);    
                            if ($stmt->execute() === true) array_push( $messages, "query3: $query" );

                            $query = "DELETE FROM users WHERE username = ?";
                            $stmt = $mysqli->prepare($query);
                            $stmt->bind_param("s", $username_to_remove);    
                            if ($stmt->execute() === true) {
                                array_push( $messages, "query3: $query" );
                                $userMessage = "$username_to_remove is verwijderd";
                                $removed = true;
                            } else  
                                $userMessage = "$username_to_remove NIET verwijderd, fout in query";
                               
                            
                        } else {
                            array_push( $messages, "$username_to_remove heeft $aantal_innames metingen en $aantal_hoegaathet hoegaathet, kan NIET verwijderd worden" );
                        }
                    }

                } else {
                    array_push( $messages, "$username_to_remove  NIET gevonden in DB, kan deze dus niet verwjderen.." );
                    $userMessage = "$username_to_remove  NIET gevonden in DB, kan deze dus niet verwjderen..";
                }
                
            } else {
                array_push( $messages, "$username_aanvrager  geen admin rechten");
                $userMessage = "$username_aanvrager heeft onvoldoende rechten om account te verwijderen";
            }

        }  else {
            array_push( $messages, "niet de juiste parameters aangeleverd");
            $userMessage = "niet de juiste parameters aangeleverd";
        }

        
        $result = [
            'messages'      => $messages,
            'userMessage'   => $userMessage,
            'removed'       => $removed
        ];
        return $result;
    }

    function get_simple_free_guest_username() {
        
        $messages = [];
        $free_username = '';
        
        $mysqli = connect();

        // call a procedure in de MySQL database die een guest account naam genereert
        //$result = $mysqli->query("call create_simple_gest_username()");
        
        $result = $mysqli->query("call create_simple_gest_username()");
        
        
        $var = $result->fetch_all(MYSQLI_ASSOC);

        $result = (json_encode($var[0]['@concept_username']));
        return $result;
    }

    function create_account($inp, $mode) {
        // Iedereen kan een account aanmaken met role G. Andere vooralsnog met de hand aanmaken
        $messages = [];
        $inp_ok = true;
        $account_created = false;
        $userMessage = '';

        if (array_key_exists('username_aanvrager', $inp)) $username_aanvrager = $inp['username_aanvrager']; else { $inp_ok=false; array_push ($messages, 'username_aanvrager niet gevonden');}
        if (array_key_exists('username_concept', $inp))   $username_concept   = $inp['username_concept'];   else { $inp_ok=false; array_push ($messages, 'username_concept niet gevonden');}
        if (array_key_exists('password_concept', $inp))   $password_concept   = $inp['password_concept'];   else { $inp_ok=false; array_push ($messages, 'password_concept niet gevonden');}
        
        if (array_key_exists('role', $inp))       $role       = $inp['role']    ;   else { $inp_ok=false; array_push ($messages, 'role niet gevonden');}
        if (array_key_exists('apikeyType', $inp)) $apikeyType = $inp['apikeyType']; else { $apikeyType = "complex";}
        if (array_key_exists('expire', $inp))     $expire     = $inp['expire'];     else { $expire = date('Y-m-d', strtotime('+1 month'));}
      
        if ($inp_ok == true) { 

            $mysqli = connect();
    
            $apikey = createApikey($apikeyType, $username_concept);

            if (get_account_bestaat($username_concept) == true) {
                   array_push($messages,"$username_concept bestaat al ");
                   $userMessage = "Niet aangemaakt, $username_concept bestaat al ";
            } else { 
             
                $query =  "INSERT INTO users (username, password, apikey, expire, role, aangemaakt_door) ";
                $query .= "VALUES(?, ?, ?, ?, ?, ? )" ;

                $stmt = $mysqli->prepare($query);
                $stmt->bind_param("ssssss", $username_concept, $password_concept, $apikey, $expire, $role, $username_aanvrager);
                if ($stmt->execute() === true) {        
                    array_push( $messages, "$username_concept toegevoegd: apikey: $apikey");
                    $userMessage = "$username_concept toegevoegd ";

                    $account_created = true ;
                } else {
                    array_push( $messages, "$username_concept NIET toegevoegd fout in INSERT" );
                    $userMessage = "$username_concept NIET toegevoegd, fout in INSERT";
                }
            } 
        }

        $result = [
            'account_created'   => $account_created,
            'userMessage'       => $userMessage,
            'messages'          => $messages
        ];
        return $result;
    }

    function vul_basis_instellingen($medicijn_settings_per_user, $medicijn_soorten_settings_per_user, $aspect_settings_per_user, $mode) {

        $messages = [];
        $inp_ok = true;

        // maak de insert voor --> medicijn_settings_per_user
        if (count($medicijn_settings_per_user) > 0 ) {
            $insert1  = " INSERT INTO medicijn_settings_per_user ";
            $insert1 .= " (naam, bijInvoerTonen, orderInList ) ";
            
            $values = "VALUES ";
            // bouw SQL insert 1
            foreach ($medicijn_settings_per_user as $med_settings) {
                $naam               = $med_settings['naam'];
                $bijInvoerTonen     = $med_settings['bijInvoerTonen']; 
                $orderInList        = $med_settings['orderInList'];

                $values .= "('$naam', '$bijInvoerTonen', '$orderInList'), " ;
            }
            $insert1 .= $values;

            // voer de insert uit
            echo ($insert1);
            
        }

        // maak de insert voor --> medicijn_soorten_settings_per_user
        if (count($medicijn_soorten_settings_per_user) > 0 ) {
            $insert2  = " INSERT INTO medicijn_soorten_settings_per_user ";
            $insert2 .= " (soort, voorschrift_huidig_dag, min_inname_dag, norm_min_inname_dag, norm_max_inname_dag, max_inname_dag, inOverzichtTonen) ";
            
            $values = "VALUES ";
            // bouw SQL insert 2
            foreach ($medicijn_soorten_settings_per_user as $med_soorten_settings) {

                $soort                      = $med_soorten_settings['soort'];
                $voorschrift_huidig_dag     = $med_soorten_settings['voorschrift_huidig_dag']; 
                $min_inname_dag             = $med_soorten_settings['min_inname_dag']; 
                $norm_min_inname_dag        = $med_soorten_settings['norm_min_inname_dag']; 
                $norm_max_inname_dag        = $med_soorten_settings['norm_max_inname_dag']; 
                $max_inname_dag             = $med_soorten_settings['max_inname_dag']; 
                $inOverzichtTonen           = $med_soorten_settings['inOverzichtTonen']; 
           
                $values .= "('$soort', '$voorschrift_huidig_dag', '$min_inname_dag', '$norm_min_inname_dag', '$norm_max_inname_dag', '$max_inname_dag', '$inOverzichtTonen'), " ;
            }
            $insert2 .= $values;
            echo ('____');
            // voer de insert uit
            echo ($insert2);
            echo ('____');
        }

        return $messages;
    }


    function setAvatar($inp) { // ook geschikt voor mebyme

        $mysqli = connect();
        $messages = [];
        array_push ($messages, 'setAvatar API gestart');
        $userMessage        = "";
        $newAvatarImageName = "" ;
        $apikey             = "";
        $target_dir         = "";
        $target_file        = "";
        $newFileAndPath     = "";
        $avatar             = "";
        $queryTst           = "";
        

        // **********  stap 1 check of input ok is   ************
        
        $inp_ok                         = true ;
        $upload_preconditions           = false;
        $upload_ok                      = false;
        $rename_file_uitgevoerd         = false;
        $rename_userTable_uitgevoerd    = false;


        if (array_key_exists('username', $inp))  {
            $username = $inp['username'];
        } else {
            array_push ($messages, 'username niet gevonden in de input');
             $inp_ok  = false;
        }
        if (array_key_exists('apikey', $inp)) {       
            $apikey = $inp['apikey'];
        } else { 
            array_push ($messages, 'apikey niet gevonden in de input');
            $inp_ok  = false;
        }
   
        array_push ($messages, 'setAvatar API 2');
        $userMessage    = "";

        if ($inp_ok) {
            $upload_preconditions    = true;

            // ********** stap 2  check apikey en upload bestand  ***********
            
            array_push ($messages, 'setAvatar API 3');
            if (apikeyValid($mysqli, $username, $apikey)) {   
                array_push ($messages, 'setAvatar API 4');
                $response = [];
                // $inputJSON = file_get_contents('php://input');    
                // $input = json_decode($inputJSON, true);
            
                $imagePath = 'images';
                $info = "-1";
                $newFileAndPath = "";
            
                if (isset($inp['imagePath'])) {
                    $target_dir = $inp['imagePath'];
                } else {
                    $target_dir =  '../src/images/avatars/';
                    //$target_dir =  '../../../../images/avatars/';
                }
            
                // ******  2a upload pre_conditions check
                $target_filename = basename($_FILES["file"]["name"]);
                
                $target_file = $target_dir . $target_filename;

                $imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));
            
                // Check if image file is a actual image or fake image
                if (isset($_POST["submit"])) {
                    $check = getimagesize($_FILES["file"]["tmp_name"]);
                    if ($check !== false) {
                        array_push ($messages, "File is an image - " . $check["mime"] . ".");
         
                    } else {
                        array_push ($messages, "File is not an image.");
                        $upload_preconditions= false;
                    }
                }
            
                // Check if file already exists
                if (file_exists($target_file)) {
                    array_push ($messages,   htmlspecialchars( $target_filename) . " niet geupload, is al in gebruik");
                    $userMessage = end($messages);
                    $upload_preconditions= false;
                }
            
                // Check file size
                if ($_FILES["file"]["size"] > 5*1024*1024 ) {
                    $filesize = $_FILES["file"]["size"] / (1024 * 1024);
                    array_push ($messages, "Fout: " .  htmlspecialchars( $target_filename) . " Avatar (image) is te groot ($filesize), kies kleiner dan 5MB");
                    $userMessage = end($messages);
                    $upload_preconditions= false;
                }
            
                // Allow certain file formats
                if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg" && $imageFileType != "gif" ) {
                    array_push ($messages, "Fout: alleen JPG, JPEG, PNG & GIF images");
                    $userMessage = end($messages);
                    $upload_preconditions= false;
                }

                // Check if $uploadOk is set to 0 by an error
                if ( $upload_preconditions == true) {
                    if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {  // dit is het uploaden 
                        $upload_ok = true;
                        $newAvatarImageName = $target_filename;
                        array_push ($messages, "De avatar (image) ". htmlspecialchars($target_filename). " is ge-upload");
                        $userMessage = end($messages);
                    } else {
                        array_push ($messages, "Fout (onbekend) bij uploaden van " . htmlspecialchars( $target_filename));
                        $userMessage = end($messages);
                    }
                } 
                
                // stap 3 rename de image eventueel, zoals door de api call is aangevraagd.
                if ( isset($inp['rename'] ) ) { // rename the uploaded file
                    if ($upload_ok == true) { 
                        $newName = $inp['rename'];
                        if (preg_match('/^[\w\-. ]+$/', $newName)) {
                            $newFileAndPath =$target_dir . $newName . "." . pathinfo($_FILES["file"]["name"])['extension'];
                            if (rename($target_file,$newFileAndPath)) {
                                $rename_file_uitgevoerd = true;
                                $newAvatarImageName=  $newName . "." . pathinfo($_FILES["file"]["name"])['extension'];
                                array_push ($messages, htmlspecialchars($target_filename) . " hernoemd naar: " . $newAvatarImageName );
                            } else 
                                array_push ($messages, "Fout (onbekend) bij hernoemen: " . htmlspecialchars( $target_filename ));
                        }
                        else { 
                            array_push ($messages, "Fout bij hernoemen, nieuwe naam: " . $newName . " is geen geldige naam ");
                        }
                    } // geen else nodig
                } else {
                    
                }
        
                if ($upload_ok) {
                    $mysqli = connect();
                    $query =  "UPDATE users SET avatar = ? WHERE username = ? ";
                
                    $queryTst =  "UPDATE users SET avatar = '$newAvatarImageName' WHERE username = '$username' ";
                    array_push($messages, $queryTst);
            
                    $stmt = $mysqli->prepare($query);
                    $stmt->bind_param("ss", $newAvatarImageName, $username);
                    if ($stmt->execute() === true) {
                        if ($mysqli->affected_rows >0) {
                            $rename_userTable_uitgevoerd = true;
                            array_push ($messages, "avatar in de tabel users aangepast: naar: " . $avatar); 
                        } else {
                            array_push ($messages, "Fout: avatar in de tabel users NIET kunnen aanpassen naar: " . $avatar); 
                            $userMessage = end($messages);
                        }
                    }  else {
                        array_push ($messages, "Fout in query: avatar in de tabel users NIET kunnen aanpassen naar: " . $avatar); 
                        $userMessage = end($messages);
                        array_push ($messages, queryTst); 

                    }
                }
          

                // stap 4 rename de avatar in de tabel van de user.               
               


            
            } // apikeyValid ...
            
        
        } else {}

        $result = [
            // ****** LET OP queryResult is een associative array met een message en de dataArray
            'messages'                      => $messages,
            'userMessage'                   => $userMessage,
            'upload_preconditions'          => $upload_preconditions,
            'inp_ok'                        => $inp_ok,
            'upload_ok'                     => $upload_ok,
            'rename_file_uitgevoerd'        => $rename_file_uitgevoerd,
            'rename_userTable_uitgevoerd'   => $rename_userTable_uitgevoerd,
            'newAvatarImageName'            => $newAvatarImageName, 
            'target_file'                   => $target_file,
            'newFileAndPath'                => $newFileAndPath,
            'target_dir'                    => $target_dir,
            'query'                         => $queryTst,
            'post'                          => $_POST
        ];
        
        echo json_encode($result);

    }
         
     // *******************************************
     //     TESTEN       TESTEN     TESTEN
     // *******************************************

    function test_login() { // mebyme check 2024-06-24
        $inputParams                        = [];
        $inputParams['username']            = 'guest';
        $inputParams['password']            = 'guest123';
        
        $inputParams['apikey_or_password']  = 'apikey'; // Log je in met password --> nieuwe API en expiredate --> ingelogd
        $inputParams['apikey']              = 'guestapikey1';

        $inputParams['apikey_type']         = 'simple';
        
        $date_today                         = date("Y-m-d");

        $result = login( $inputParams);

        echo("<h3> username: "           . $inputParams['username']                    ." </h3>");
        echo("<h3> logged_in: "          . ($result['logged_in']? "true" : "false")    . " </h3>");
        echo("<h3> username_exists: "    . ($result['username_exists']? "ja" : "nee")  . " </h3>");
        echo("<h3> apikey: "             . $result['apikey']                           . " </h3>");
        echo("<h3> apikey correct: "     . $result['apikey_correct']                   . " </h3>");
        echo("<h3> date_today: "         . $result['date_today']                       . " </h3>");
        echo("<h3> apikey_expireDate: "  . $result['apikey_expireDate']                . " </h3>");
        echo("<h3> apikey_expired: "     . $result['apikey_expired']                   . " </h3>");
        echo("<h3> result_message: "     . $result['result_message']                   . " </h3>");
    }

    function test_get_hgh_period() { // mebyme check 2024-06-24
        $inputParams['username'] = 'guest';
        $inputParams['apikey']   = '72e63fe6d8538f6b7b72421762b8d737';

        $inputParams['startDate'] = '2024-06-19';
        $inputParams['endDate']   = '2024-06-26';
        
        $date_today               = date("Y-m-d");
        
        echo ('<h5> test_get_hgh_period </h5>');


        $result = [
            'hghPeriod'        => get_HGH_period($inputParams, "prod")
        ];

        echo ('<h3>dataPerAspect</h3>');
        foreach($result['hghPeriod']['dataPerAspect'] as $item) {
            echo ($item['aspect'] . ' - ' .  $item['icon']);
            echo ('<h5>  </h5>');
        }
        echo ('<h3> teTonenAspecten </h3>');
        foreach($result['hghPeriod']['teTonenAspecten'] as $item) {
            echo json_encode($item);
            echo ('<h5>  </h5>');
        }
        echo ('<h3> messages </h3>');
        
        foreach($result['hghPeriod']['messages'] as $item) {
            echo json_encode($item);
            echo ('<h5>  </h5>');
        }
    }

    function test_get_period_week() { // mebyme check 2024-06-24
        $inputParams['username']  = 'guest';
        $inputParams['apikey']    = '688346d25b9c9faa43dbd43bdcd1e7b4';

        $inputParams['startDate'] = '2024-06-24';
        $inputParams['endDate']   = '2024-07-24';
        
        $date_today               = date("Y-m-d");

        $result = [
            'weekData'  => get_period_week($inputParams, "prod")
        ];
        echo ('<h5>  </h5>');
        echo ('<h2>test_get_period_week</h2>');
        echo ('<h5>  </h5>');
        echo ('start datum: ' . $inputParams['startDate'] . 'end datum: ' . $inputParams['endDate'] );

        echo ('<h3>data: </h3>');
        foreach($result['data'] as $item) {
            echo json_encode($item);
            echo ('<h5> </h5>');
        }

        
        echo ('<h3>data_alleWeken_inPeriode: </h3>');
        foreach($result['weekData']['data_alleWeken_inPeriode'] as $item) {
            echo json_encode($item);
            echo ('<h5> </h5>');
        }
    }


    function test_vul_basis_instellingen() {
        
        $medicijn_settings_per_user = [
            [   'naam'            => 'ventolin_100',
                'bijInvoerTonen'  => 'ja',
                'orderInList'     => 10
            ],
            [   'naam'            => 'alvesco_160',
                'bijInvoerTonen'  => 'ja',
                'orderInList'     => 20
            ],
            [   'naam'            => 'prednison_10',
               'bijInvoerTonen'  => 'kan',
                'orderInList'     => 36
            ],
            [   'naam'            => 'prednison_20',
               'bijInvoerTonen'  => 'kan',
                'orderInList'     => 34
            ],
            [   'naam'            => 'prednison_30',
               'bijInvoerTonen'  => 'kan',
                'orderInList'     => 30
            ]
        ];

        $medicijn_soorten_settings_per_user = [ 
            [   'soort'                     => 'ventolin',
                'voorschrift_huidig_dag'    => 'indienNodig',
                'min_inname_dag'            => 0,
                'norm_min_inname_dag'       => 2,
                'norm_max_inname_dag'       => 6,
                'max_inname_dag'            => 10,
                'inOverzichtTonen'          => 'ja'
            ],
            [   'soort'                     => 'alvesco',
                'voorschrift_huidig_dag'    => 'indienNodig',
                'min_inname_dag'            => 2,
                'norm_min_inname_dag'       => 4,
                'norm_max_inname_dag'       => 6,
                'max_inname_dag'            => 6,
                'inOverzichtTonen'          => 'ja'
        ],
            [   'soort'                     => 'prodnison',
                'voorschrift_huidig_dag'    => 'kuur',
                'min_inname_dag'            => 0,
                'norm_min_inname_dag'       => 10,
                'norm_max_inname_dag'       => 30,
                'max_inname_dag'            => 40,
                'inOverzichtTonen'          => 'ja'
            ]
        ];
         
        $aspect_settings_per_user = [
            [   'aspect'            => 'benauwd',
                'aspectGroup'       => 'benauwd',
                'orderInList'       =>  10,
                'bijInvoerTonen'    => 'ja',
                'inOverzichtTonen'  => 'ja'
            ],
            [   'aspect'            => 'vermoeid',
                'aspectGroup'       => 'vermoeid',
                'orderInList'       =>  20,
                'bijInvoerTonen'    => 'ja',
                'inOverzichtTonen'  => 'kan'
            ],
            [   'aspect'            => 'hartritme',
                'aspectGroup'       => 'hart',
                'orderInList'       =>  30,
                'bijInvoerTonen'    => 'kan',
                'inOverzichtTonen'  => 'kan'
            ],
        ];

        var_dump(vul_basis_instellingen  ($medicijn_settings_per_user, $medicijn_soorten_settings_per_user,  $aspect_settings_per_user, 'test') );
    }

    function test_GetMedicijnLijstBeheer() {
        // echo ('test medzijnLijstBeheer');
        $inputParams=[];
        $inputParams['username'] = 'guest';
        $inputParams['apikey']   = 'guestApiKey123';
        $inputParams['doel']="alles";
        $inputParams['startDate'] = '2023-08-25';
        $inputParams['endDate'] = '2023-09-06';

        $result = getMedicijnLijstVoorBeheer($inputParams, "test");            
        echo json_encode($result); // returns a JSON string  
    }

    function test_get_data_1_medicijn() {
        // echo ('test medzijnLijstBeheer');
        $inputParams=[];
        $inputParams['username'] = 'guest';
        $inputParams['apikey']   = 'guestApiKey123';
        $inputParams['medicijnNaam']="diltiazem_60_T";

        $result = get_data_1_medicijn($inputParams, "test");
        echo json_encode($result); // returns a string
        echo('--------------');
        var_dump($_POST);
    }
  
    function test_koppel_medicijn_aan_user() {
        echo ('test medzijnLijstBeheer');
        $inputParams['medicijn']  = 'diltiazem_60_T';
        $inputParams['username']  = 'admin';
        $inputParams['for_user']  = 'Omar';
        $inputParams['apikey']    = 'adminApiKey123';
        $result = koppel_medicijn_aan_user($inputParams, "test");            
        echo json_encode($result); // returns a JSON string  
    }

    function test_update_User_1MedicijnData() {
        // echo ('test medzijnLijstBeheer');
        $inputParams['medicijn']    = 'prednison_10';
        $inputParams['username']    = 'admin';
        $inputParams['for_user']    = 'omar';
        $inputParams['orderInList'] =10;
        $inputParams['apikey']      = 'adminApiKey123';
        $inputParams['min_inname_dag']      = 0;
        $inputParams['norm_min_inname_dag'] = 5;
        $inputParams['norm_max_inname_dag'] = 30;
        $inputParams['max_inname_dag']      = 40;
        $result = update_User_1MedicijnData($inputParams, "test");            
        echo json_encode($result); // returns a JSON string  
    }

    function test_update_of_insert_waarde_1aspect() { // mebyme
        
        // echo ('test medzijnLijstBeheer');
        $inputParams['username']    = 'guest';
        $inputParams['apikey']      = 'guest3apikey9';
        $inputParams['datum']       = '2024-06-18';
        $inputParams['aspect']      = 'dezedag';
        $inputParams['waarde']      =  4;

        $result = update_of_insert_waarde_1aspect($inputParams, "test");            
        
        foreach($result['messages'] as $message) {
            echo json_encode($message);
            echo ('<h5> </h5>');
        }
    }

    function test_update_or_create_hgh_waarneming() { // mebyme
        
        // echo ('test medzijnLijstBeheer');
        $inputParams['username']    = 'guest';
        $inputParams['apikey']      = '688346d25b9c9faa43dbd43bdcd1e7b4';
        $inputParams['datum']       = '2024-06-17';
        $inputParams['aspect']      = 'dezedag';
        $inputParams['waarde']      =  4;
        $inputParams['opmerking']   =  "17testOpmerking223";


        $result = update_or_create_hgh_waarneming($inputParams, "test");            
        
        foreach($result['messages'] as $message) {
            echo json_encode($message);
            echo ('<h5> </h5>');
        }
    }

    function test_koppel_aspect_aan_1user() { // mebyme
        
        // echo ('test medzijnLijstBeheer');
        $inputParams['username']    = 'omar';
        $inputParams['apikey']      = 'bdc7d457f33d3f86db16975af9050017';
        $inputParams['aspect']      = 'energie';

           $result = koppel_aspect_aan_1user($inputParams, "test");            
        
        foreach($result['messages'] as $message) {
            echo json_encode($message);
            echo ('<h5> </h5>');
        }
    }

    function test_medicijnLijst_user() {
        $inputParams['username']      = 'guest';
        $inputParams['apikey']        = 'guestApiKey123';   
        $result = get_gekoppeld_en_te_koppelen_medicijnen_voor_user($inputParams, "test");     
        echo json_encode($result['gekoppelde_medicijnen']);
        echo('<br>');   echo('<br>');   echo('<br>');
        echo json_encode($result['te_koppelen_medicijnen']);     
        echo('<br>');   echo('<br>');
        echo json_encode($result['messages']);
    }

    function test_get_aspectLijsten_user() {
        $inputParams['username']      = 'guest';
        $inputParams['apikey']        = 'guestApiKey123';   
        $result = get_aspectLijsten_user($inputParams);    

        echo('<h3>gekoppelde aspecten</h3>');  
        echo json_encode($result['gekoppelde_aspecten']);

        echo('<h3>te koppelen aspecten</h3>'); 
        echo json_encode($result['te_koppelen_aspecten']);     
        
        echo('<h3>messages</h3>'); 
        foreach($result['messages'] as $message) {
            echo json_encode($message);
            echo ('<h5> </h5>');
        }
    }

    function test_get_meta_accounts_compact() {
       $inputParams['username_aanvrager']  = 'admin1';
       $inputParams['api_aanvrager']       = 'adminApikey123';   
       //$inputParams['username_aanvrager']     = 'guest';
       //$inputParams['api_aanvrager']          = 'guestApiKey123';   
    
        $result = get_meta_accounts_compact($inputParams, 'test');
        var_dump("<h3/>");

        if (array_key_exists('users', $result))      
            echo ('users bestaat: ' . count($result['users']));
        else 
            echo ('geen users gevonden');
        var_dump("<h3/>");
        var_dump($result);
        var_dump("<h3/>");

        var_dump("<h3/>");
        echo('<h3>users</h3>');
         var_dump("<h3/>");
        foreach($result['users'] as $user) {
            var_dump ($user);
            var_dump('__');
        };
        var_dump('__');
        echo('<h3>messages</h3>');
         var_dump("<h3/>");
        foreach($result['messages'] as $message) {
            var_dump ($message);
            var_dump('__');
        };
    }

    function test_get_meta_accounts_1() {

        $inputParams['username_aanvrager']  = 'admin';
        $inputParams['api_aanvrager']       = '3853c41900ffad04684d0c4368240570';   
   
        $result = get_meta_accounts_1($inputParams, 'test');
        foreach($result['messages'] as $message) {
             var_dump ('<h5> ' . $message . ' </h5>');
         };
         var_dump('<h5>__</h5>'); 
        
         foreach($result['user_info'] as $user_infoRow) {
            var_dump ($user_infoRow);
            var_dump('<h5>_</h5>');
        
        };
        var_dump('<h5>__</h5>');
     
    }

    function test_remove_account() {
        // $inputParams['username_aanvrager']        = 'guest';
        // $inputParams['api_aanvrager']             = 'guestApiKey123';   
         $inputParams['username_aanvrager']        = 'admin';
         $inputParams['api_aanvrager']             = 'jhdedjd@!kE';   
        $inputParams['username_to_remove']        = 'guest1';   
         
        $result = remove_account($inputParams, 'test');
        var_dump('__');
        var_dump('<h3> test_remove_account() </h3>');

        foreach($result['messages'] as $message) {
            var_dump ($message);
            var_dump('<h5/>');
        };
        var_dump('<h5/>');
        var_dump('__result___ : '); 
        var_dump('<h5/>'); 
        if ($result['removed']) 
            var_dump("<h5> !! " . $inputParams['username_to_remove']  . " verwijderd <h5/>"); 
        else 
            var_dump("<h5> XX " . $inputParams['username_to_remove']  . " NIET verwijderd <h5/>"); 
        
    }

    function test_create_account() {
       
        $inputParams['username_aanvrager']  = 'admin';
        $inputParams['api_aanvrager']       = '__jhdedjd@!kE'; 

        $inputParams['username_to_create']  = 'guest3';
        $inputParams['apikeyType']          = 'simple';   // simple, complex 
        $inputParams['password']            = 'guest3123';
        $inputParams['expire']              =  date('Y-m-d', strtotime('+2 month'));
        $inputParams['role']                = 'G';
        
        //var_dump ($inputParams);

        var_dump(create_account($inputParams, "test"));
    }

    function test_missingInputParameters() {
        $inputParams['username_aanvrager']        = 'admin';
        $inputParams['api_aanvrager']             = 'jhdedjd@!kE';   
        $inputParams['username_to_remove']        = 'guest1';   
        
        $missingInputParameters = missingInputParameters($inputParams, ['username_aanvrager','username_to_add']);
        
        if (count($missingInputParameters) >0 ) {
            echo ('fout in input, er mist minimaal 1 parameter, zie messages'); 
            var_dump('<h4/>');
            var_dump($missingInputParameters);
        } else echo ('alle items gevonden'); 
        
    }

    function test_update_role() {
        $inputParams['username_aanvrager']  = 'admin';
        $inputParams['api_aanvrager']       = '7dfafc256b2d809fd77396de47672ff8'; 
        $inputParams['username_to_edit']    = 'guest5';
        $inputParams['new_role']            = 'E';
       
        $update_role_result = update_role($inputParams, "productie");
        
        if ($update_role_result['succes'] == true)
            echo ' update uitgevoerd ' .  $update_role_result['userMessage'];
        else 
            echo ' update NIET uitgevoerd ' .  $update_role_result['userMessage'];
    }

    //  ****************************************************************
    //  ********************  EINDE TESTEN *****************************
    //  ****************************************************************



    $file = fopen('./react_test.log', 'w'); ftruncate($file, 0); fclose($file);
    error_log("test\n", 3, "./react_test.log"); 
    //error_log(implode("", $_POST), 3, "./react_test.log"); 

    if (isset($_POST)) {
        error_log("\n POST bestaat zeker \n", 3, "./react_test.log"); 
        $post = implode("", $_POST);
        $post1 =  json_encode($_POST);
        error_log("\n post \n", 3, "./react_test.log"); 
        error_log($post, 3, "./react_test.log");
        error_log("\n", 3, "./react_test.log"); 
        error_log("\n post 1 \n", 3, "./react_test.log"); 
        error_log($post1, 3, "./react_test.log");  
        
    } else {
        error_log("\n POST bestaat NIET", 3, "./react_test.log"); 
    }

    if (isset($_POST['action'])) {
        error_log("\naction set", 3, "./react_test.log"); 
        //check op rechten (ApiKey)

        $response_MedicijnLijst ="geen update MedicijnLijst uitgevoerd";

        $test = "0";
    
        if ($_POST['action'] == 'login') { // data van één specifiek medicijn, niet van (norm) gebruik door een user
            $response = login($_POST, "prod"); // $mode = test or something else (= prod)
            echo json_encode($response); // returns a string         
    
        } else if ($_POST['action'] == 'update_role') { // 
            $response = update_role($_POST, "prod"); // $mode = test or something else (= prod) 
            echo json_encode($response); // returns a JSON string
     
        } else if ($_POST['action'] == 'get_roles') { // 
            echo json_encode(['E', 'A', 'G', ]); // returns a standard list as JSON string

        } else if ($_POST['action'] == 'get_naam_alle_medicijnen') {
            $medicijnLijst=[];
            $response = get_naam_alle_medicijnen($_POST, "prod"); // $mode = test or something else (= prod) 
            $response = [
                'medicijnLijst'   =>   $response['resultData'],
                'messages'        =>   $response['messages']
            ];
            echo json_encode($response); // returns a string
    
        } else if ($_POST['action'] == 'get_data_1_medicijn') { // data van één specifiek medicijn, niet van (norm) gebruik door een user
            $medicijnLijst=[];
            $response = get_data_1_medicijn($_POST, "prod"); // $mode = test or something else (= prod) 
            $response = [
                'medicijnInfo' =>   $response['resultData'],
                'messages'     =>   $response['messages']
            ];
            echo json_encode($response); // returns a string

        } else if ($_POST['action'] == 'get_HGH_period') { // hoe gaat het data van user en aan user gekoppeld aspecten
                $response = [
                    'hghPeriod'  => get_HGH_period($_POST, "prod")
                ];
                echo json_encode($response); 

        } else if ($_POST['action'] == 'get_user_settings_1_medicijn') { // data van settings één specifiek medicijn van een user
            $medicijnLijst=[];
            $response = get_user_settings_1_medicijn($_POST, "prod"); // $mode = test or something else (= prod) 
            $response = [
                'medicijnInfo'  =>   $response['resultData'],
                'messages'      =>   $response['messages']
            ];
            echo json_encode($response); // returns a string

        } else if ($_POST['action'] == 'get_medicijnLijst_user') { // alle medicijnen van 1 user, of 1 medicijn (hangt af van parameter)
            // $_POST['welkeLijst']; kan bevatten: 'admin', 'userLijst', 'userUitLijstgebreid', 'user1Medicijn'  
            $medicijnLijst=[];
            $response = get_medicijnLijst_user($_POST, "prod"); //     
            echo json_encode($response); // returns a JSON string

        } else if ($_POST['action'] == 'insertMedicijnData') { // één specifiek medicijn
            $medicijnLijst=[];
            $response = insert_MedicijnData($_POST, "prod"); // $mode = test or something else (= prod)        
            echo json_encode($response); 

        } else if ($_POST['action'] == 'updateMedicijnData') { // één specifiek medicijn
            $response = update_MedicijnData($_POST, "prod"); // $mode = test or something else (= prod) 
            echo json_encode($response); // returns a JSON string

        } else if ($_POST['action'] == 'koppelMedicijnAanUser') { // één specifiek medicijn aan een user koppelen = nieuwe regel in 2 tabellen
            $response = koppel_medicijn_aan_user($_POST, "prod"); // $mode = test or something else (= prod) 
            echo json_encode($response); // returns a JSON string

        } else if ($_POST['action'] == 'update_User_1MedicijnData') { // 
            $response = update_User_1MedicijnData($_POST, "prod"); 
            echo json_encode($response); 

        //  ***** ASPECTEN  HGH  **********

        } else if ($_POST['action'] == 'get_alle_aspecten') {
            $aspectLijst=[];
            $response = get_alle_aspecten($_POST, "prod"); // $mode = test or something else (= prod) 
            $response = [
                'aspectenLijst'   =>   $response['resultData'],
                'messages'        =>   $response['messages']
            ];
            echo json_encode($response); // returns a string

        } else if ($_POST['action'] == 'get_data_1_aspect') { // data van één specifiek aspect, 
            $aspectLijst=[];
            $response = get_data_1_aspect($_POST, "prod"); // $mode = test or something else (= prod) 
            $response = [
                'aspectInfo' =>   $response['resultData'],
                'messages'     =>   $response['messages']            
            ];
            echo json_encode($response); // returns a string

        } else if ($_POST['action'] == 'get_aspectLijsten_user') { // 
            $response = get_aspectLijsten_user($_POST); 
            echo json_encode($response); 
       
        } else if ($_POST['action'] == 'get_user_settings_1_aspect') { // data van settings één specifiek aspect van een user
            $aspectLijst=[];
            $response = get_user_settings_1_aspect($_POST, "prod"); // $mode = test or something else (= prod) 
            $response = [
                'aspectInfo'  =>   $response['resultData'],
                'messages'    =>   $response['messages']
            ];
            echo json_encode($response); // returns a string

        } else if ($_POST['action'] == 'update_User_1AspectData') { // 
            $response = update_User_1AspectData($_POST, "prod"); 
            echo json_encode($response); 

        } else if ($_POST['action'] == 'update_or_create_hgh_waarneming') { // mebyme 
            $response = update_or_create_hgh_waarneming($_POST, "prod"); 
            echo json_encode($response); 

        } else if ($_POST['action'] == 'update_aspect_bijInvoerTonen_1User') { // mebyme 
            $response = update_aspect_bijInvoerTonen_1User($_POST, "prod"); 
            echo json_encode($response); 

        } else if ($_POST['action'] == 'getIconData') { // mebyme  
            $responce = leesFilenames_V2('./images/mebyme_icons', "nameSort" );
            echo json_encode($response); 

        } else if ($_POST['action'] == 'updateAspectData') { // één specifiek aspect bijv de kleur
            $response = update_AspectData($_POST, "prod"); // $mode = test or something else (= prod) 
            echo json_encode($response); // returns a JSON string

        } else if ($_POST['action'] == 'koppelAspectAanUser') { // één specifiek aspect aan een user koppelen = nieuwe regel in 2 tabellen
            $response = koppel_aspect_aan_user($_POST, "prod"); // $mode = test  or something else (= prod) 
            echo json_encode($response); // returns a JSON string

        } else if ($_POST['action'] == 'koppel_aspect_aan_1User') { // mebyme  
            $response = koppel_aspect_aan_1user($_POST, "prod"); // $mode = test  or something else (= prod) 
            echo json_encode($response); // returns a JSON string
      
        } else if ($_POST['action'] == 'insertAspect') { // één specifiek aspect
            $aspectLijst=[];
            $response = insert_aspect($_POST, "prod"); // $mode = test or something else (= prod)        
            echo json_encode($response); 
         
        } else if ($_POST['action'] == 'get_account_status') { // 
            $response = get_account_status($_POST, "prod");
            echo json_encode($response); 
         
        } else if ($_POST['action'] == 'get_meta_accounts_compact') { // 
            $response = get_meta_accounts_compact($_POST, "prod");
            echo json_encode($response); 
        
        } else if ($_POST['action'] == 'get_meta_accounts_1') { // 
            $response = get_meta_accounts_1($_POST, "prod");
            echo json_encode($response); 

        } else if ($_POST['action'] == 'create_account') { // 
            $response = create_account($_POST, "prod");
            echo json_encode($response); 
            
        } else if ($_POST['action'] == 'remove_account') { // 
            $response = remove_account($_POST, "prod");
            echo json_encode($response); 
            
        } else if ($_POST['action'] == 'get_simple_free_guest_username') { // 
            $response = get_simple_free_guest_username();
            echo $response; 

        } else if ($_POST['action'] == 'setAvatar') { // 
            $response = setAvatar($_POST);
            echo $response; 
            
        } else {
            echo json_encode("Deze API moet aangeroepen worden vanuit een front-end met de juiste parameters. " .  $_POST['action'] . " wordt niet herkend"); 
        }

    } else {

        // phpinfo()
        // FOR TESTING if you want to use echo..:  
        //    --> temporarely comment the line: header('Content-Type: application/json');
        // test_login();
        // test_get_naam_alle_medicijnen();

        // test_get_data_1_medicijn();
        // test_get_medicijnen_met_User();
    
        // test_koppel_medicijn_aan_user();
    
        // test_update_User_1MedicijnData();

        // test_koppel_aspect_aan_1user();

        // test_update_of_insert_waarde_1aspect(); 
        // test_update_or_create_hgh_waarneming() ;

        // test_get_period_week();

        // test_get_info_1_medicijn_1_user();

        // test_get_medicijnLijst_user();

        // test_get_aspectLijsten_user();
        test_get_hgh_period();

        // test_get_usernames();
        // test_get_meta_accounts_compact();
        // test_get_meta_accounts_1();
        // test_remove_account();

        // test_create_account();
        // test_vul_basis_instellingen();

        // echo get_simple_free_guest_username() ;

        // test_missingInputParameters();
        // test_update_role();
        // leesFilenames_V2('avatars', 'dateSort');
    }
?>