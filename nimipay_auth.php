<?php
    
    // mysql db login details
    DB::$user = '';
    DB::$password = '';
    DB::$dbName = '';

    // NIM address that receives payments
    $nim_address = "NQ13 YOUR WALL ETAD DRES S1F9 T4L7 EA13 N7MP";

    // get your free API key at https://nimiqx.com
    $nimiqx_api_key = "yourApiKey11ad54er9we8ds5d";

    $nimiqx_txs = "https://api.nimiqx.com/account-transactions/".$nim_address."?api_key=".$nimiqx_api_key;


?>