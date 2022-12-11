const {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  AmbientLight,
  Clock,
  MeshStandardMaterial,
  BoxGeometry,
  Mesh,
  Raycaster,
  Vector2,
  DirectionalLight,
  HemisphereLight,
} = require("three");
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const canvas = document.querySelector("#three-canvas");
const count = document.querySelector(".count");
const renderer = new WebGLRenderer({
  canvas,
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);

const scene = new Scene();

const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
scene.add(camera);
camera.position.set(0, 6, 10);

const planeGeometry = new BoxGeometry(100, 0.5, 100);
const planeMaterial = new MeshStandardMaterial({
  color: "slategray",
});
const planeMesh = new Mesh(planeGeometry, planeMaterial);
planeMesh.position.y = -1;

scene.add(planeMesh);

let heartModel;

const loader = new GLTFLoader();
loader.load("/models/heart.gltf", (glb) => {
  heartModel = glb.scene.children[0];
  heartModel.position.set(0, 1.5, 0);
  heartModel.scale.set(0.05, 0.05, 0.05);
  heartModel.castShadow = true;
  scene.add(heartModel);
});

const controls = new OrbitControls(camera, renderer.domElement);

const raycaster = new Raycaster();
const mouse = new Vector2();

const ambientLight = new AmbientLight("white", 0.5);
scene.add(ambientLight);

var dirLight = new DirectionalLight(0xffffff);
dirLight.position.set(75, 300, -75);
scene.add(dirLight);

const hemiLight = new HemisphereLight(0xffffff, 0x444444, 0.1);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const clock = new Clock();

function draw() {
  const delta = clock.getDelta();
  if (heartModel) {
    heartModel.rotation.z += 0.01;
  }
  controls.update();
  renderer.render(scene, camera);
  renderer.setAnimationLoop(draw);
}

async function getCount() {
  const res = await fetch("http://13.124.112.248:5001/click")
    .then((data) => data.json())
    .then((data) => (count.innerHTML = data[0].count));
}
count.innerHTML = getCount();

function checkIntersects() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([heartModel]);
  for (const item of intersects) {
    console.log(item);
    item.object.material.color.set("red");
    getCount();
    break;
  }
}

function setSize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
}

window.addEventListener("resize", setSize);
canvas.addEventListener("click", (e) => {
  mouse.x = (e.clientX / canvas.clientWidth) * 2 - 1;
  mouse.y = -((e.clientY / canvas.clientHeight) * 2 - 1);
  checkIntersects();
});

draw();
