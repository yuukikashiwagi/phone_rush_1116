import * as THREE from 'three'

// 各変数、各定数の宣言

// エリアの設定
const gravity = 0.05 // 重力

// エリアで用いられる 3D モデルと写真のダウンロード
const textureloader = new THREE.TextureLoader();
const glbloader = new GLTFLoader();

// texture内に保存されているjpgのパス
const textureUrls = [
    '', // 道
    '', // ゴールテープ
];

// 読み込むGLBモデルのパス
const glbUrls = [
    '',// プレイヤー // ここに追加
    'glb/houses.glb',// 周り
    'glb/phone.glb', // コイン
    '', // 障害物１ // ここに追加
    '', // 障害物2
];

// プレイヤーの変数定数を宣言
let player;
let player_v_y = 0
const initial_velocity = 0.8

// センサー
let alpha;
let beta;
let gamma;
let aX;
let aY;
let aZ;

// シーン
var scene = new THREE.Scene();
// カメラ
const camera = new THREE.PerspectiveCamera(
    90, // 視野角
    window.innerWidth / window.innerHeight, //アスペクト比
    0.1, // 一番見える近いところ
    10000, // 一番見える遠いところ
)
camera.position.set(0, 4, 10)

// レンダラー
const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// カメラの手動
const controls = new OrbitControls(camera, renderer.domElement)

// ライト
// 並行光源の作成
// 場所によって影が変更されない
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(10, 10, 10)
scene.add(light);

// プレイヤーの描写
// ここに記述

// 建物の描写
glbloader.load(glbUrls[0], function (gltf) {
    for ( var i = -24 ; i <= 24 ; i++){
        if (i !== 0){
            var model = gltf.scene.clone()
            model.rotation.set(0, ( Math.PI / 2 ) * Math.sign(i),0) // 建物が横を向くように回転
            model.position.set(-14 * Math.sign(i),0, -10 * Math.abs(i)) // 建物をコースの両端に配置
            scene.add(model)
        }
    }
},undefined, function ( error ) {
	console.error( error );
} );

// スマホの描写
// ここに記述

// 障害物の描写
for (var g=1 ; g<10 ; g++ ){
    const groundGeometry = new THREE.ConeGeometry( 1, 4.5, 32 ); // コーンのジオメトリを作成 (BoxGeometry)
    var sphereMaterial = new THREE.MeshPhongMaterial({color:0xFF0000});
    const model = new THREE.Mesh(groundGeometry, sphereMaterial); // メッシュを作成 (ジオメトリ + マテリアル)
    const randomIndex = Math.floor(Math.random() * 3) // 0,1,2のランダム
    model.position.set(course[randomIndex],1, -10*g)
    enemy_list.push(model)
    scene.add(model)
}

// 道の描写
textureloader.load(textureUrls[0], function (texture) {
    const groundGeometry = new THREE.BoxGeometry(24, 0.5, 200); // 地面のジオメトリを作成 (BoxGeometry)
    var sphereMaterial = new THREE.MeshPhongMaterial();
    sphereMaterial.map = texture;
    const ground = new THREE.Mesh(groundGeometry, sphereMaterial); // メッシュを作成 (ジオメトリ + マテリアル)
    ground.position.set(0, -0.3, -100); // 地面の位置を設定
    ground.receiveShadow = true; // 影を受け取る設定
    scene.add(ground);
},undefined, function ( error ) {
	console.error(error);
} );

// ゴールテープの描写
// ここに記述

// センサーの値の読み取り
document.addEventListener("DOMContentLoaded", function () {
    aX = 0, aY = 0, aZ = 0;                     // 加速度の値を入れる変数を3個用意
    alpha = 0, beta = 0, gamma = 0;  

    // 加速度センサの値が変化したら実行される devicemotion イベント
    //ここに追加

    // ジャイロセンサー
    // ここに追加

    // 指定時間ごとに繰り返し実行される setInterval(実行する内容, 間隔[ms]) タイマーを設定
    var graphtimer = window.setInterval(() => {
        displayData();
    }, 33); // 33msごとに

    function displayData() {
        // センサーの値を表示
        // ここに追加
    }
})

// プレイヤーの左右移動
function move(){
    // ここに追加
}

// プレイヤーのジャンプ
function jump(){
    // ここに追加
}

// 衝突判定
function collision(){
    // 障害物との衝突
    // ここに追加

    // スマホとの衝突
    // ここに追加

    // ゴールテープとの衝突
    // ここに追加
}

function animate(){
    const animationId = requestAnimationFrame(animate)

    // 追加 Mixer

    move()
    jump()
    collision()
    renderer.render(scene, camera);
}

// ウィンドウのリサイズイベントをリッスン
window.addEventListener('resize', () => {
    // レンダラーのサイズを更新
    renderer.setSize(window.innerWidth, window.innerHeight);

    // カメラのアスペクト比を更新
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); // プロジェクションマトリクスを更新
});

animate();