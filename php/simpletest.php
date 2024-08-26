<?php  

 header('Access-Control-Allow-Origin: *');
//  header('Content-Type: application/json');
 header("Access-Control-Allow-Methods: POST");
 header("Access-Control-Max-Age: 3600");
 header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

 
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
            $myDatabase = "kimproce_astma";
            $dbUsername   = "kimproce_astlam01";
            $password   = "QWbn6AwaU47N";
            $localhost = "localhost bij externe server: " .$user_host ; 
        }
        mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
        return new mysqli($servername, $dbUsername, $password, $myDatabase);
    }

    if (isset($_POST)) {
        error_log("\n POST bestaat zwel \n", 3, "./react_test.log"); 
       
        
    } else {
        error_log("\n POST bestaat NIET", 3, "./react_test.log"); 
    }

    echo json_encode("test 01"); // returns a string

    if (isset($_POST['action'])) {
        error_log("\n action set", 3, "./react_test.log"); 
        //check op rechten (ApiKey)
      
        if ($_POST['action'] == 'test') { // data van één specifiek medicijn, niet van (norm) gebruik door een user
            echo json_encode("test 3"); // returns a string
        } else {
            echo json_encode("Deze API moet aangeroepen worden vanuit een front-end met de juiste parameters"); 
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
        
        // test_get_info_1_medicijn_1_user();

        // test_get_medicijnLijst_user();

        // test_get_aspectLijst_user();
        // test_get_hgh_periode();

        // test_get_usernames();
        // test_get_meta_accounts_compact();
        // test_remove_account();

        // test_create_account();
        // test_vul_basis_instellingen();

        // echo get_simple_free_guest_username() ;

        // test_missingInputParameters();
        // test_update_role();
        // leesFilenames_V2('avatars', 'dateSort');
    }
?>