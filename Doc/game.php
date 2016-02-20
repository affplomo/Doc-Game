<!DOCTYPE html>
<html>
<head>
    <link href='http://fonts.googleapis.com/css?family=Fanwood+Text' rel='stylesheet' type='text/css'>
    <title>Game</title>
    <link rel="stylesheet" href="css/style.css" type="text/css" />
</head>
<body>
  <?php
  function init(){
    //create pdo and se up connection
    $dsn      = 'mysql:host=site1.local;dbname=docGame;';
    $login    = 'homestead';
    $password = 'secret';
    $options  = array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'UTF8'");
    $pdo      = null;
    try {
        $pdo = new PDO($dsn, $login, $password, $options);
    } catch (PDOException $e) {
        echo 'Connection failed: ' . $e->getMessage();
    }
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);



    return $pdo;
  }

  function getPlayers(){
    global $pdo;
    $sql = "SELECT * FROM player;";
    $sth = $pdo->prepare($sql);
    $sth->execute();
    $res = $sth->fetchObject();
    foreach ($res as $key => $value) {
      print_r("$key = $value<br>");
    }
  }

  $pdo = init();
  //retreive players
  getPlayers();
  ?>
    <div id="loadimg"></div>
    <div id="shadowbackground" class="show">
        <div id="pop" class="hidden">
            <p id="dead" class="hidden">You died!</p><p><br />Start a new game?</p>
            <button id="button_dead" class="newgame" type="button">New Game</button>
        </div>
        <div id="pop" class="show">
            <p id="welcometext">Please enter a name.</p>
            <!--<textarea draggable="false" autofocus="autofocus" id="playerName" rows="1" maxlength="10"></textarea>-->
            <input draggable="false" autofocus="autofocus" id="playerName" maxlength="10">
            <p id="nameerror" class="hidden"><br />Your name must only contain characters.</p>
            <button id="button_new" class="newgame" type="button">New Game</button>
        </div>
    </div>
    <p id="debugtext"></p>
    <p id="latency"></p>
    <p id="sincos"></p>
    <span id="span"></span>
    <div id="canvas">
        <canvas id="myCanvas" tabindex="1"></canvas>
        <script src="http://localhost:8000/socket.io/socket.io.js"></script>
        <!--<script src="http://85.226.127.203:8000/socket.io/socket.io.js"></script>-->
    </div>
    <img id="map"  />

    <!--<script type="text/javascript">
        function downloadJSAtOnload() {
            var element = document.createElement("script");
            element.src = "js/game.js";
            document.body.appendChild(element);
        }
        if (window.addEventListener)
            window.addEventListener("load", downloadJSAtOnload, false);
        else if (window.attachEvent)
            window.attachEvent("onload", downloadJSAtOnload);
        else window.onload = downloadJSAtOnload;
    </script>-->
    <script src="js/init.js"></script>
    <script src="js/item.js"></script>
    <script src="js/json.js"></script>
    <script src="js/map.js"></script>
    <script src="js/projectile.js"></script>
    <script src="js/monster.js"></script>
    <script src="js/player.js"></script>
    <script src="js/resources.js"></script>
    <script src="js/socket.js"></script>
    <script src="js/sprites.js"></script>
    <script src="js/functions.js"></script>
    <script src="js/game.js"></script>
</body>
</html>
