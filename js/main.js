import {
  AnimationMixer,
  Box3,
  Box3Helper,
  BoxGeometry,
  ConeGeometry,
  DirectionalLight,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  Scene,
  TextureLoader,
  Vector3,
  WebGLRenderer
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "loaders";

// 各変数、各定数の宣言
// レーンの設定
let index = 1;
const course = [-5, 0, 5];

let mixer;

// エリアの設定
const gravity = 0.05; // 重力

let isOnce = false;
let ios = true;

// オブジェクト
let geometry;
let sphereMaterial;
let model;
let helper;

// プレイヤーの変数定数を宣言
let player;
let playerBox;
let player_v_y = 0;
const initial_velocity = 0.8;
let isJumping = false;
let isMoving = false;
let box_X;
let box_Y;
let box_Z;

// ゴール
let goal;
let goalBoundingBox;

// センサ
let alpha;
let beta;
let gamma;
let aX;
let aY;
let aZ;

let debug;
let phone_list = [];
let enemy_list = [];

let firstZ;
// シーン
const scene = new Scene();
// カメラ
const camera = new PerspectiveCamera(
  90,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);
camera.position.set(0, 4, 10);

// レンダラー
const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true
});
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// カメラの手動
const controls = new OrbitControls(camera, renderer.domElement);

// ライト
const light = new DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

// texture 内に保存されている jpg のパス
const textureUrls = [
  "textures/ground.jpg", // 道
  "textures/goal.jpg" // ゴール
];

// 読み込む GLB モデルのパス
const glbUrls = [
  "models/player_spare.glb", // プレイヤー
  "models/houses.glb", // 周りの建物
  "models/phone.glb" // スマホ
];

// エリアで用いられる 3D モデルと写真のダウンロード
const textureloader = new TextureLoader();
const glbloader = new GLTFLoader();

// プレイヤーの描画
glbloader.load(
  glbUrls[0],
  function (gltf) {
    player = gltf.scene;
    player.scale.set(3, 2, 3);
    player.rotation.set(0, Math.PI, 0);
    player.position.set(0, 0, 0);
    mixer = new AnimationMixer(player); // 解説 1
    const runningAction = gltf.animations.find(
      (animation) => animation.name === "running"
    ); // 解説 2
    if (runningAction) {
      mixer.clipAction(runningAction).play(); // 解説 3
    } else {
      console.warn("Running animation not found in the model.");
    }
    scene.add(player);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// 建物の描画
glbloader.load(
  glbUrls[1],
  function (gltf) {
    for (let i = -40; i <= 40; i++) {
      if (i !== 0) {
        model = gltf.scene.clone();
        model.rotation.set(0, (Math.PI / 2) * Math.sign(i), 0);
        model.position.set(-14 * Math.sign(i), 0, 20 - 10 * Math.abs(i));
        scene.add(model);
      }
    }
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// スマホの描画
glbloader.load(
  glbUrls[2],
  function (gltf) {
    for (let g = 1; g < 10; g++) {
      model = gltf.scene.clone();
      model.scale.set(15, 15, 15);
      model.rotation.set(0, Math.PI / 4, Math.PI / 4);
      const randomIndex = Math.floor(Math.random() * 3); // 0 、1 、2 のランダム
      model.position.set(course[randomIndex], 2, -10 * g);
      phone_list.push(model); // オブジェクトのバウンディングボックスを計算
      scene.add(model);
    }
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// 障害物の描画
for (let g = 1; g < 12; g++) {
  geometry = new ConeGeometry(1, 4, 32);
  sphereMaterial = new MeshPhongMaterial({ color: 0xff0000 });
  const model = new Mesh(geometry, sphereMaterial);
  const randomIndex = Math.floor(Math.random() * 3);
  model.position.set(course[randomIndex], 2, -15 * (g + 1));
  enemy_list.push(model);
  scene.add(model);
}

// 道の描画
textureloader.load(
  textureUrls[0],
  function (texture) {
    geometry = new BoxGeometry(24, 0.5, 400);
    sphereMaterial = new MeshPhongMaterial();
    sphereMaterial.map = texture;
    const ground = new Mesh(geometry, sphereMaterial);
    ground.position.set(0, -0.3, -180);
    ground.receiveShadow = true;
    scene.add(ground);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// ゴールの描画
textureloader.load(
  textureUrls[1],
  function (texture) {
    geometry = new BoxGeometry(24, 10, 0.5); // 地面のジオメトリを作成 (BoxGeometry)
    sphereMaterial = new MeshPhongMaterial();
    sphereMaterial.map = texture;
    goal = new Mesh(geometry, sphereMaterial); // メッシュを作成 (ジオメトリ + マテリアル)
    goal.position.set(0, 5, -200);
    goalBoundingBox = new Box3().setFromObject(goal);
    // ground.receiveShadow = true; // 影を受け取る設定
    scene.add(goal);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// センサの値の読み取り
document.addEventListener("DOMContentLoaded", function () {
  (aX = 0), (aY = 0), (aZ = 0);
  (alpha = 0), (beta = 0), (gamma = 0);

  // 一度だけ実行
  if (!isOnce) {
    const handleDeviceMotion = (dat) => {
      firstZ = dat.accelerationIncludingGravity.z;
      if (firstZ > 0) {
        ios = false;
      }
      isOnce = true;
      window.removeEventListener("devicemotion", handleDeviceMotion); // リスナーを解除
    };
    window.addEventListener("devicemotion", handleDeviceMotion);
  }

  // 加速度センサの値の取得
  if (ios) {
    // iOS の時
    window.addEventListener("devicemotion", (dat) => {
      aX = dat.accelerationIncludingGravity.x || 0;
      aY = dat.accelerationIncludingGravity.y || 0;
      aZ = dat.accelerationIncludingGravity.z || 0;
    });
  } else {
    // android の時
    window.addEventListener("devicemotion", (dat) => {
      aX = -dat.accelerationIncludingGravity.x || 0;
      aY = -dat.accelerationIncludingGravity.y || 0;
      aZ = -dat.accelerationIncludingGravity.z || 0;
    });
  }

  // ジャイロセンサの値の取得
  window.addEventListener(
    "deviceorientation",
    (event) => {
      alpha = event.alpha || 0;
      beta = event.beta || 0;
      gamma = event.gamma || 0;
      console.log("Gyro:", alpha, beta, gamma);
    },
    false
  );

  // 一定時間ごとに
  let graphtimer = window.setInterval(() => {
    displayData();
  }, 33);

  // 描画する関数
  function displayData() {
    let result = document.getElementById("result");
    result.innerHTML =
      "alpha: " +
      alpha.toFixed(2) +
      "<br>" +
      "beta: " +
      beta.toFixed(2) +
      "<br>" +
      "gamma: " +
      gamma.toFixed(2) +
      "<br>" +
      "aX" +
      aX +
      "<br>" +
      "aY" +
      aY +
      "<br>" +
      "aZ" +
      aZ +
      "<br>" +
      ios;
  }
});

// プレイヤーの移動
function move() {
  player.position.z -= 0.2;
  if (gamma > 20 && !isMoving) {
    if (index == 0 || index == 1) {
      isMoving = true;
      index += 1;
      player.position.x = course[index];
    }
  } else if (gamma < -20 && !isMoving) {
    if (index == 1 || index == 2) {
      isMoving = true;
      index -= 1;
      player.position.x = course[index];
    }
  } else if (gamma < 1.5 && gamma > -1.5) {
    isMoving = false;
  }
}

// プレイヤーのジャンプ
function jump() {
  if (!isJumping && aZ > 0) {
    player_v_y = initial_velocity;
    isJumping = true;
  } else if (isJumping) {
    player_v_y -= gravity;
    player.position.y += player_v_y;
    if (player.position.y <= 0) {
      isJumping = false;
      player.position.y = 0;
    }
  }
}

// 衝突判定
function collision() {
  box_X = 3;
  box_Y = 4;
  box_Z = 2; // サイズが合うように変えてみましょう。
  geometry = new BoxGeometry(box_X, box_Y, box_Z);
  sphereMaterial = new MeshPhongMaterial({ color: 0xff0000 });
  playerBox = new Mesh(geometry, sphereMaterial);
  playerBox.position.set(
    player.position.x,
    player.position.y + box_Y / 2,
    player.position.z
  );
  playerBox.updateWorldMatrix(true, true);
  const playerBoundingBox = new Box3().setFromObject(playerBox);
  helper = new Box3Helper(playerBoundingBox, 0xff0000);
  // scene.add(helper);

  // 障害物との衝突
  enemy_list = enemy_list.filter((enemy) => {
    const enemyBoundingBox = new Box3().setFromObject(enemy);
    helper = new Box3Helper(enemyBoundingBox, 0xff0000);
    // scene.add(helper);
    if (playerBoundingBox.intersectsBox(enemyBoundingBox)) {
      window.location.href = "./index.html";
      return false; // この敵を削除
    }
    return true;
  });

  // スマホとの衝突
  phone_list = phone_list.filter((phone) => {
    const phoneBoundingBox = new Box3().setFromObject(phone);
    helper = new Box3Helper(phoneBoundingBox, 0xff0000);
    // scene.add(helper);
    if (playerBoundingBox.intersectsBox(phoneBoundingBox)) {
      scene.remove(phone);
      return false; // このスマホを削除
    }
    return true;
  });

  // ゴールとの衝突
  if (goal) {
    goalBoundingBox = new Box3().setFromObject(goal);
    if (playerBoundingBox.intersectsBox(goalBoundingBox)) {
      console.log("ゴール");
      window.location.href = "./index.html";
    }
  }
}

function animate() {
  const animationId = requestAnimationFrame(animate);

  // Mixer
  if (mixer) {
    mixer.update(0.01); // 時間の経過量
  }

  if (player) {
    // 移動関数の実行
    move();
    // ジャンプ関数の実行
    jump();
    // 衝突判定関数の実行
    collision();
    // カメラの移動
    camera.position.set(0, 8, player.position.z + 10);
    camera.lookAt(new Vector3(0, 5, player.position.z));
  }
  renderer.render(scene, camera);
}

// サイズ変更
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

animate();
