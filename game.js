var materialsnake, materialsnakehead;

var snake_height = 0.06; // half snake height
var geometrysnake = new THREE.BoxGeometry(0.1, 0.1, snake_height);//0.1/sqrt(3) 0.057735
var geometrysnakehead = new THREE.CylinderGeometry(0.057735, 0.057735, snake_height, 3)

var materialapple;
var geometryapple = new THREE.SphereGeometry(0.05, 32, 32);
var cameraLoc = { x: 0, y: -2, z: 7 };

var light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(new THREE.Vector3(-4, -4, 4))
var scoretitle;

var renderer_left, renderer_right;
var scene_left, scene_right;
var camera_left, camera_right;
var over_shoulder = true;
var ranking = {};
var playerN = 1;
var name = 'Lin Zhu';
var directions = [];
var numNP = 2;
var tick; //interval
var testVal = 333;
var interval_time = testVal;
const dirPicker = ['A', 'D', 'W', 'W', 'W', 'W'];// W: forward, A: turn left, D: turn right
var beginningBlockNumber = 2;
var numOfApples = 50;
var board_left = []; // marks N: empty S: snake A: apple
var board_right = [];
var repo = 'https://raw.githubusercontent.com/zhulinn/3D-Snake/master/'
function preConfigure() {
    scores = [0];
    responsive = true;
    gameOver = false;
    moved = false;
    needNewApple = false;
    needNewSnake = -1;
    pause = true;
    play = true;
    snakes_left = [[]];
    snakes_right = [[]];
    numNP = parseInt(npPicker.value);
    console.log(numNP);
    for (var i = 1; i <= numNP; i++) {
        snakes_left.push([]);
        snakes_right.push([]);

    }
    console.log(snakes_left);
    for (var i = 0; i < 40; i++) {
        board_left[i] = [];
        for (var j = 0; j < 40; j++) {
            board_left[i][j] = { type: 'N', mesh: null };

        }
    }

    for (var i = 0; i < 40; i++) {
        board_right[i] = [];
        for (var j = 0; j < 40; j++) {
            board_right[i][j] = { type: 'N', mesh: null };

        }
    }

    WIDTH = left_container.offsetWidth;
    HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 45, ASPECT = WIDTH / HEIGHT, NEAR = 0.01, FAR = 10000;

    // Left View
    renderer_left.setSize(0.9 * WIDTH, 0.9 * HEIGHT);
    left_container.append(renderer_left.domElement);
    camera_left = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera_left.position.set(cameraLoc.x, cameraLoc.y, cameraLoc.z);
    scene_left = new THREE.Scene();
    camera_left.lookAt(scene_left.position);
    scene_left.add(camera_left);
    scene_left.add(light);


    //Right View
    renderer_right.setSize(0.8 * WIDTH, 0.8 * HEIGHT);
    right_container.append(renderer_right.domElement);
    camera_right = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera_right.position.set(cameraLoc.x, cameraLoc.y, cameraLoc.z);
    scene_right = new THREE.Scene();
    camera_right.lookAt(scene_right.position);
    scene_right.add(camera_right);
    scene_right.add(light);
    // Add Objects
    genApples(); // both left and right are same
    createWalls(scene_left);
    createGrid(scene_left);
    createWalls(scene_right);
    createGrid(scene_right);
    genSnakes()
    document.getElementById("fsGUI").innerHTML = "SCORE: " + 0 + "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp" + "LENGTH: " + 2;
}
function displayranking() {

    var entries = Object.entries(ranking);
    var sorted = entries.sort(function (a, b) { return b[1] - a[1] })
    rankingContainer.innerHTML = '';
    for (var i = 0; i < sorted.length; i++) {
        rankingContainer.innerHTML += (i + 1) + ": " + sorted[i][0] + "&nbsp&nbsp-&nbsp&nbsp" + sorted[i][1] + "<br/>";
    }
}

function init() {
    document.addEventListener("keydown", onDocumentKeyDown, false);
    renderer_right = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer_left = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    left_container = document.getElementById("left");
    right_container = document.getElementById("right");
    bgm = document.getElementById('bgmplayer');
    eat = document.getElementById('eatplayer');
    end = document.getElementById('endplayer');
    scoretitle = document.getElementById("fsGUI");
    rankingContainer = document.getElementById("ranking");
    difficultyPicker = document.getElementById("mode");
    npPicker = document.getElementById("NP");
    preConfigure();
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    if (play && !pause && moved) {
        moved = false;
        if (gameOver) {
            clearInterval(tick);
            console.log("clear")
            difficultyPicker.disabled = false;
            console.log("Game Over")
            play = false;
            pause = true;
            var res = window.prompt("Game Over!! Record Your Name: ", name);
            if (!res || res.length == 0) name = 'Anonymous';
            else name = res;
            console.log(name);

            npPicker.disabled = false;
            if (ranking[name] == undefined || ranking[name] < scores[0]) {
                ranking[name] = scores[0];
            }
            displayranking();


        } else {
            //player

            for (var idx = 0; idx < snakes_left.length; idx++) {
                if (idx >= playerN) {
                    setAction_NP(idx);
                }
                update(scene_left, board_left, snakes_left, idx);
                update(scene_right, board_right, snakes_right, idx);
                if (needNewSnake != -1) {
                    var tmp = needNewSnake;
                    needNewSnake = -1;
                    OneSnake(tmp)
                }
                if (over_shoulder) {
                    updateFirstCamera(camera_left);
                }
                if (needNewApple) {
                    oneApple(materialapple);
                    needNewApple = false;
                    if (idx == 0) {
                        incrementScore(idx);
                        eat.pause();
                        eat.currentTime = 0;
                        eat.play();
                    }
                }
            }
            responsive = true;
        }

    }
    renderer_left.render(scene_left, camera_left);
    renderer_right.render(scene_right, camera_right);
}


function update(scene, board, snakes, idx) {
    var meshes = snakes[idx];
    if (meshes.length == 0) return;
    direction = directions[idx];
    var oldtail = {}
    oldtail.x = meshes[meshes.length - 1].position.x;
    oldtail.y = meshes[meshes.length - 1].position.y;

    if (direction == "r") {
        right(meshes);
        meshes[0].rotation.y = Math.PI / 2;
    } else if (direction == "l") {
        left(meshes);
        meshes[0].rotation.y = -Math.PI / 2;

    } else if (direction == "u") {
        up(meshes);
        meshes[0].rotation.y = 0;

    } else if (direction == "d") {
        down(meshes);
        meshes[0].rotation.y = Math.PI;

    }
    // Apple or Game Over
    var i = toIndex(meshes[0].position.y);
    var j = toIndex(meshes[0].position.x);
    if (i < 0 || j < 0 || i > 39 || j > 39 || board[i][j].type == 'S') {
        if (idx < playerN) {
            gameOver = true;
            end.play();
            bgm.pause();
            bgm.currentTime = 0;
        } else {
            if (meshes.length == 2 && !(i < 0 || j < 0 || i > 39 || j > 39))
                console.log("");
            removeSnake(scene, meshes, board, oldtail);

            snakes[idx] = [];
            needNewSnake = idx;
        }
    } else {
        var headCell = board[i][j];
        if (headCell.type == 'A') { //apple
            scene.remove(headCell.mesh); //remove apple
            headCell.type = 'S';
            headCell.mesh = null;
            needNewApple = true;
            //add tail
            if (idx < playerN) {

                var tail = new THREE.Mesh(geometrysnake, materialplayer);
            } else {
                var tail = new THREE.Mesh(geometrysnake, materialsnake);

            }
            tail.position.x = oldtail.x;
            tail.position.y = oldtail.y;
            meshes.push(tail);
            scene.add(tail);
        } else if (headCell.type == 'N') {
            headCell.type = 'S';
            var ti = toIndex(oldtail.y);
            var tj = toIndex(oldtail.x);
            board[ti][tj].type = 'N';
        }
    }

}

function removeSnake(scene, meshes, board, oldtail) {
    scene.remove(meshes[0]);
    meshes[0].geometry.dispose();
    meshes[0].material.dispose();

    for (var k = 1; k < meshes.length; k++) {
        var ti = toIndex(meshes[k].position.y);
        var tj = toIndex(meshes[k].position.x);
        // if (ti >= 0 && tj >= 0 && ti <= 39 && tj <= 39) {
        board[ti][tj].type = 'N';
        // }
        scene.remove(meshes[k]);
        meshes[k].geometry.dispose();
        meshes[k].material.dispose();

    }
    var ti = toIndex(oldtail.y);
    var tj = toIndex(oldtail.x);
    board[ti][tj].type = 'N';
}

function updateFirstCamera(camera) {
    camera.fov = 120;
    meshes = snakes_left[0];
    if (meshes.length != 0) {
        head = meshes[0];
        camera.position.set(head.position.x, head.position.y, 1.3 * snake_height);
        if (directions[0] == "r") {
            var lookatvecter = new THREE.Vector3(4, head.position.y, snake_height);
            camera.lookAt(lookatvecter);
            // console.log(camera.rotation.x )
            camera.rotation.x = Math.PI / 2;
            // camera.rotation.y = Math.PI / 2;
        } else if (directions[0] == "l") {
            var lookatvecter = new THREE.Vector3(-4, head.position.y, snake_height);
            camera.lookAt(lookatvecter);
            // console.log(camera.rotation.x )
            camera.rotation.x = Math.PI / 2;
            // console.log(camera.rotation.x )

        } else if (directions[0] == "u") {
            var lookatvecter = new THREE.Vector3(head.position.x, 4, snake_height);
            camera.lookAt(lookatvecter);
            // console.log(camera.rotation.x )
        } else if (directions[0] == "d") {
            var lookatvecter = new THREE.Vector3(head.position.x, -4, snake_height);
            camera.lookAt(lookatvecter);
            camera.rotation.z = Math.PI;
        }
        camera.updateProjectionMatrix();
    }
}



function onDocumentKeyDown(event) {

    var keyCode = event.code;
    //alert(keyCode);

    if (keyCode == 'Space') {
        if (!pause) {
            clearInterval(tick);
            console.log("clear")
            difficultyPicker.disabled = false;
            moved = false;
            responsive = false;
            pause = true;
            bgm.pause();
        } else {
            difficultyPicker.disabled = true;
            npPicker.disabled = true;
            if (!play || parseInt(npPicker.value) != numNP) preConfigure();
            tick = setInterval(function () {
                moved = true;  // move is true in game
            }, setInterval_time());
            console.log("set " + interval_time);
            pause = false;
            responsive = true;
            bgm.play();
        }
    }
    if (responsive) {
        if (keyCode == 'ArrowUp' && (directions[0] == 'l' || directions[0] == 'r')) {


            directions[0] = 'u';
            responsive = false;
        } else if (keyCode == 'ArrowLeft' && (directions[0] == 'd' || directions[0] == 'u')) { //LEFT


            directions[0] = "l";
            responsive = false;

        } else if (keyCode == 'ArrowRight' && (directions[0] == 'd' || directions[0] == 'u')) { //RIGHT



            directions[0] = "r";
            responsive = false;
        } else if (keyCode == 'ArrowDown' && (directions[0] == 'l' || directions[0] == 'r')) {
            directions[0] = 'd';
            responsive = false;
        }
        //For Over-shoulder View
        if (keyCode == 'KeyA') {  //First Person View: Turn Left
            responsive = false;
            turnLeft(0);
        } else if (keyCode == 'KeyD') { //First Person View: Turn Right
            responsive = false;
            turnRight(0);
        }

    }
}

function takeBodyParts(meshes) {
    for (var i = meshes.length - 1; i > 0; i--) {
        meshes[i].position.x = meshes[i - 1].position.x;
        meshes[i].position.y = meshes[i - 1].position.y;
    }

}

function right(meshes) {

    // console.log("GO RIGHT");
    takeBodyParts(meshes);
    meshes[0].position.x += 0.1;
}

function left(meshes) {
    // console.log("GO LEFT");

    takeBodyParts(meshes);

    meshes[0].position.x -= 0.1;

}

function up(meshes) {
    // console.log("GO UP");

    takeBodyParts(meshes);

    meshes[0].position.y += 0.1;

}

function down(meshes) {
    // console.log("GO DOWN");

    takeBodyParts(meshes);
    meshes[0].position.y -= 0.1;

}


function createGrid(scene) {
    //grass
    var loader = new THREE.TextureLoader();
    loader.load(repo + 'res/grass.jpg',
        function (texture) {
            var geometry = new THREE.PlaneGeometry(4, 4, 4);
            var material = new THREE.MeshBasicMaterial({ color: 0x26A65B, map: texture, side: THREE.DoubleSide, transparent: false });
            var plane = new THREE.Mesh(geometry, material);
            scene.add(plane);
        });

    helper = new THREE.GridHelper(4, 40, 0x888888, 0x888888);
    helper.position.x = 0;
    helper.position.y = 0;
    helper.position.z = 0;
    helper.material.opacity = 100;
    helper.material.transparent = true;
    helper.rotation.x = Math.PI / 2;
    helper.rotation.y = 0;
    scene.add(helper);
}

function createWalls(scene) {
    var loader = new THREE.TextureLoader();
    loader.load(
        // resource URL
        repo + 'res/wall.jpg',
        // Function when resource is loaded
        function (texture) {
            // do something with the texture

            material = new THREE.MeshBasicMaterial({
                color: 0xf24343,
                map: texture,
                transparent: false
            });
            material2 = new THREE.MeshBasicMaterial({
                color: 0x54575b,
                map: texture,
                transparent: false
            });
            material3 = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                map: texture,
                transparent: false
            });
            material4 = new THREE.MeshBasicMaterial({
                color: 0x058e1a,
                map: texture,
                transparent: false
            });
            //4*4 area
            //wall thinness 0.1
            wall = getCube(4.2, 0.1, 0.28, material, { x: 0, y: 2.05, z: 0.14 });//up
            wall2 = getCube(4.2, 0.1, 0.28, material2, { x: 0, y: -2.05, z: 0.14 });//down
            wall3 = getCube(0.1, 4.2, 0.28, material3, { x: 2.05, y: 0, z: 0.14 });//right
            wall4 = getCube(0.1, 4.2, 0.28, material4, { x: -2.05, y: 0, z: 0.14 });//left

            scene.add(wall);
            scene.add(wall2);
            scene.add(wall3);
            scene.add(wall4);
        }
    );

}


function genSnakes() {
    var loader = new THREE.TextureLoader();
    loader.load(
        // resource URL  
        repo + 'res/snake.png',
        function (texture) {


            materialsnakehead = new THREE.MeshBasicMaterial({ color: 0xff66ff, map: texture, transparent: true });
            materialsnake = new THREE.MeshBasicMaterial({ color: 0xffcccc, map: texture, transparent: true });

            materialplayerhead = new THREE.MeshBasicMaterial({ color: 0xffff00, map: texture, transparent: true });
            materialplayer = new THREE.MeshBasicMaterial({ color: 0xff9900, map: texture, transparent: true });
            for (var k = 0; k < numNP + 1; k++) {
                OneSnake(k);
            }
        }
    );
}
function isValidBirth(row, col) {
    for (var i = 0; i < beginningBlockNumber; i++) {
        if (board_left[row][col + i].type != 'N') return false;
    }
    return true;
}

function OneSnake(idx) {
    var row, col;
    directions[idx] = 'l';
    do {
        row = THREE.Math.randInt(5, 35);
        col = THREE.Math.randInt(5, 35);
    } while (!isValidBirth(row, col));
    snakes_left[idx] = [];
    snakes_right[idx] = [];
    if (idx < playerN) {//player
        materialhead = materialplayerhead;
        materialbody = materialplayer;
    } else {
        materialhead = materialsnakehead;
        materialbody = materialsnake;
    }
    for (var i = 0; i < beginningBlockNumber; i++) {
        if (i == 0) {
            snakes_left[idx][i] = new THREE.Mesh(geometrysnakehead, materialhead);
            snakes_left[idx][i].rotation.x = -Math.PI / 2;
            snakes_left[idx][i].rotation.y = -Math.PI / 2;
            snakes_right[idx][i] = new THREE.Mesh(geometrysnakehead, materialhead);
            snakes_right[idx][i].rotation.x = -Math.PI / 2;
            snakes_right[idx][i].rotation.y = -Math.PI / 2;
        } else {
            snakes_left[idx][i] = new THREE.Mesh(geometrysnake, materialbody);
            snakes_right[idx][i] = new THREE.Mesh(geometrysnake, materialbody);

        }

        board_left[row][col] = { type: 'S', mesh: null };
        board_right[row][col] = { type: 'S', mesh: null };
        snakes_left[idx][i].position.x = toCoord(col);
        snakes_right[idx][i].position.x = toCoord(col);
        snakes_left[idx][i].position.y = toCoord(row);
        snakes_right[idx][i].position.y = toCoord(row);
        scene_left.add(snakes_left[idx][i]);
        scene_right.add(snakes_right[idx][i]);
        col++;
    }
    // console.log("original: " + (snakes_right[idx][0].position.x + ", " + snakes_right[idx][0].position.y))
}

function genApples() {
    var loader = new THREE.TextureLoader();
    loader.load(
        // resource URL
        repo+ 'res/apple.jpg',
        // Function when resource is loaded

        function (texture) {
            // do something with the texture
            materialapple = new THREE.MeshBasicMaterial({
                // color: 0xA0522D,
                map: texture,
                transparent: false
            });

            for (var z = 0; z < numOfApples; z++) {
                oneApple(materialapple);
            }
        }
    );

}
function oneApple(materialapple) {

    //materialfruit = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    var apple = new THREE.Mesh(geometryapple, materialapple);
    var row, col;
    do {
        row = THREE.Math.randInt(0, 39);
        col = THREE.Math.randInt(0, 39);
    } while (board_left[row][col].type != 'N');

    apple.position.z = 0.05;
    // row = 20;
    // col = 17;
    apple.position.y = toCoord(row);
    apple.position.x = toCoord(col);

    var copy = new THREE.Mesh(geometryapple, materialapple);
    copy.position.z = apple.position.z
    copy.position.y = apple.position.y
    copy.position.x = apple.position.x
    board_left[row][col] = { type: 'A', mesh: apple };
    board_right[row][col] = { type: 'A', mesh: copy };

    scene_left.add(apple);
    scene_right.add(copy);
}
function setAction_NP(idx) {
    var randDir = THREE.Math.randInt(0, dirPicker.length - 1);
    var action = dirPicker[randDir];
    if (action == 'A') {
        turnLeft(idx);
    } else if (action == 'D') {
        turnRight(idx);
    }
}
function turnLeft(idx) {
    if (directions[idx] == "u") {
        directions[idx] = "l";
    } else if (directions[idx] == "d") {
        directions[idx] = "r";
    } else if (directions[idx] == "l") {
        directions[idx] = "d";
    } else if (directions[idx] == "r") {
        directions[idx] = "u";
    }
}
function turnRight(idx) {
    if (directions[idx] == "u") {
        directions[idx] = "r";
    } else if (directions[idx] == "d") {
        directions[idx] = "l";
    } else if (directions[idx] == "l") {
        directions[idx] = "u";
    } else if (directions[idx] == "r") {
        directions[idx] = "d";
    }
}

function toIndex(x) {
    x -= 0.05;
    x /= 0.1;

    x += 20
    return Math.round(x);
}
function toCoord(i) {
    i -= 20;
    i *= 0.1;
    i += 0.05;
    return Math.round(i * 100) / 100;
}
function getCube(w, l, d, material, position) {
    var geometry = new THREE.BoxGeometry(w, l, d);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = position.x;
    mesh.position.y = position.y;
    mesh.position.z = position.z;
    return mesh;
}

function incrementScore(idx) {
    scores[idx] += Math.round(1000 / interval_time*(numNP+1));
    var fsGUI = document.getElementById("fsGUI");
    fsGUI.innerHTML = "SCORE: " + scores[idx] + "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp" + "LENGTH: " + snakes_right[idx].length;
}


function setInterval_time() {
    var difficulty = difficultyPicker.value;
    console.log(difficulty);
    if (difficulty == "EASY") {
        interval_time = 500;
    } else if (difficulty == "MEDIUM") {
        interval_time = 250;
    } else if (difficulty == "HARD") {
        interval_time = 100;
    } else {
        interval_time = testVal;
    }
    return interval_time;

}

function handleMusic() {
    var status = document.getElementById('musicSwitch').checked;
    bgm.muted = status;
    eat.muted = status;
    end.muted = status;
}