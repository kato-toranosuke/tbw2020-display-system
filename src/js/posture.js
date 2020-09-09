'use strict';
import { GeneralFuncs } from './generalFuncs.js'

export class Posture extends GeneralFuncs {
  constructor(posture_node_id) {
    super();
    this.posture_node_id = posture_node_id;
    this.init();
  }

  init() {
    // 表示領域を取得
    const posture_node = document.getElementById(this.posture_node_id);
    const width = posture_node.clientWidth;
    const height = posture_node.clientHeight;

    // scene: ステージ
    this.scene = new THREE.Scene();

    // mesh: 物体
    // - geometry 形状
    // - material 材質
    this.mesh = this.createTriangle(50, 10);
    this.scene.add(this.mesh);

    // light
    // - 平行光源
    const light = new THREE.DirectionalLight(0xffffff, 1); // 色, 強さ
    light.position.set(0, 100, 30);
    this.scene.add(light);
    // - 環境光
    const ambient = new THREE.AmbientLight(0x404040);
    this.scene.add(ambient);

    // camera
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 5000);
    this.camera.position.set(200, 200, 300);
    this.camera.lookAt(this.scene.position);

    // helper
    const gridHelper = new THREE.GridHelper(200, 50); // 全体サイズ/1つのグリッドの大きさ
    this.scene.add(gridHelper);

    const axisHelper = new THREE.AxesHelper(1000); // 軸のサイズ
    this.scene.add(axisHelper);

    const lightHelper = new THREE.DirectionalLightHelper(light, 20); //サイズ
    this.scene.add(lightHelper);

    // renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    // this.renderer.setClearColor(0xefefef);
    this.renderer.setClearColor(0x000000);
    this.renderer.setPixelRatio(window.devicePixelRatio); //高解像度ディスプレイ向けの設定。これを設定するときれいに表示される。
    posture_node.appendChild(this.renderer.domElement);

    // controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

    // shadow
    this.renderer.shadowMap.enabled = true;
    light.castShadow = true;
    light.shadow.camera.left = -200;
    light.shadow.camera.right = 200;
    light.shadow.camera.top = 200;
    light.shadow.camera.bottom = -200;
    const shadowHelper = new THREE.CameraHelper(light.shadow.camera);
    this.scene.add(shadowHelper);

    this.render();
  }

  // 三角柱をつくる。原点は底面正三角形の重心、柱の高さの半分の位置とする。
  // length: 底面の正三角形の辺の長さ
  // height: 三角柱の高さ
  createTriangle(length, height) {

    const faceColor = 0x00ff00;

    const halfHeight = height / 2.0;
    const halfLength = length / 2.0;
    // 正三角形の重心から辺へ下ろした垂線の長さ
    const distanceToLine = halfLength * Math.tan(Math.PI / 6.0);
    // 正三角形の頂点から対辺へ垂線を下ろしたときの、垂線と重心の間の距離
    const distanceFromVertex = halfLength / Math.tan(Math.PI / 6.0) - distanceToLine;

    const vertices = [
      new THREE.Vector3(-halfLength, halfHeight, distanceToLine),   // 上面の三角形の頂点
      new THREE.Vector3(0, halfHeight, -distanceFromVertex),
      new THREE.Vector3(halfLength, halfHeight, distanceToLine),
      new THREE.Vector3(-halfLength, -halfHeight, distanceToLine),   // 下面の三角形の頂点
      new THREE.Vector3(0, -halfHeight, -distanceFromVertex),
      new THREE.Vector3(halfLength, -halfHeight, distanceToLine),
    ];
    const faces = [
      new THREE.Face3(0, 2, 1), // 上面
      new THREE.Face3(3, 4, 5), // 下面
      new THREE.Face3(0, 3, 2), // 手前側面
      new THREE.Face3(2, 3, 5),
      new THREE.Face3(0, 1, 3), // 左側面
      new THREE.Face3(1, 4, 3),
      new THREE.Face3(2, 5, 4), // 右側面
      new THREE.Face3(4, 1, 2),
    ];

    const geometry = new THREE.Geometry();
    for (let i = 0; i < vertices.length; i++) {
      geometry.vertices.push(vertices[i]);
    }
    for (let i = 0; i < faces.length; i++) {
      geometry.faces.push(faces[i]);
    }

    const material = new THREE.MeshBasicMaterial({ color: faceColor });
    // 三角柱のワイヤーフレームを描く
    const wireframeGeometry = new THREE.EdgesGeometry(geometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });

    const triangleMesh = new THREE.Mesh(geometry, material);
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);

    triangleMesh.add(wireframe);
    return triangleMesh;
  }

  render() {
    // 再起的にrender関数を呼び出すと、毎回thisの中身が変化するので、bindしてあげる。
    requestAnimationFrame(this.render.bind(this)); //ブラウザの描画更新単位で処理を呼び出す。タブがアクティブでないと動作を抑制する。
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  updateValue(roll, pitch, yaw) {
    this.mesh.rotation.set(roll, pitch, yaw);
  }
}