import * as THREE from 'three';
import Scene from './scene.js';
import GLTFLoader from './gltf.js';

const PLANT_SCALE = 50;
const loader = new GLTFLoader();
const clock = new THREE.Clock();
const phoshoMeter = document.querySelector('#phosphorus .fill');
const hydroMeter = document.querySelector('#hydration .fill');
window.hydroMeter = hydroMeter;

function loadPlant(scene, cb){
  return (gltf) => {
    let child = gltf.scene.children[0];
    let plant = child.children[0];
    child.scale.set(PLANT_SCALE, PLANT_SCALE, PLANT_SCALE);
    plant.material.color = {
      r: 1,
      g: 1,
      b: 1
    };
    plant.material.side = THREE.DoubleSide;
    scene.add(child);
    cb(child, gltf.animations);
  }
}

function loadPot(scene, cb){
  return (gltf) => {
    let child = gltf.scene.children[0];
    child.scale.set(PLANT_SCALE, PLANT_SCALE, PLANT_SCALE);
    child.material.color = {
      r: 1,
      g: 1,
      b: 1
    };
    scene.add(child);
    cb(child);
  }
}

class Plant {
  constructor(modelPath) {
    this.scene = new Scene({
      enableControls: true
    });
    this.scene.controls.enablePan = false;

    this.hydration = 1.0;
    this.phosphorus = 1.0;

    loader.load('/static/models/plant.gltf', loadPlant(this.scene, (obj, animations) => {
      this.plant = obj.children[0];
      obj.position.set(0, -60, 0);
      console.log(animations);

      // 0 -> happy animation
      // 1 -> wilt animation
      // 2 -> idle animation
      this.animations = animations;
      this.mixer = new THREE.AnimationMixer(this.plant);
      this.idle();
    }));

    loader.load('/static/models/pot.gltf', loadPot(this.scene, (obj) => {
      obj.position.set(0, -100, 0);
    }));
  }

  update() {
    this.hydration -= 0.0005;
    this.hydration = Math.max(0, this.hydration);

    this.phosphorus -= 0.0005;
    this.phosphorus = Math.max(0, this.phosphorus);

    hydroMeter.style.height = `${this.hydration * 100}%`;
    phoshoMeter.style.height = `${this.phosphorus * 100}%`;
    if (this.hydration <= 0 || this.phosphorus <= 0) {
      this.wilt();
    }
  }

  idle() {
    let anim = this.mixer.clipAction(this.animations[2]);
    anim.play();
  }

  wilt() {
    let color = this.plant.material.color;
    let anim = this.mixer.clipAction(this.animations[1]);
    anim.clampWhenFinished = true;
    anim.setLoop(THREE.LoopOnce, 1);
    anim.play();
    let colorTween = new TWEEN.Tween(color)
      .to({r:0.8, g:0.3, b:0.5}, 800)
      .onUpdate(() => {
        this.plant.material.color = color;
      }).start();
  }

  happy() {
    let anim = this.mixer.clipAction(this.animations[0]);
    anim.reset();
    anim.setLoop(THREE.LoopOnce, 1);
    let onFinish = (e) => {
      anim.reset();
      this.idle();
      this.mixer.removeEventListener('finished', onFinish);
    }
    this.mixer.addEventListener('finished', onFinish)
    anim.play();
  }
}

let plant_el = document.getElementById('plant-model');
let plant = new Plant(plant_el.dataset.model);
plant_el.appendChild(plant.scene.renderer.domElement);

plant.scene.renderer.domElement.addEventListener('click', () => {
  if (plant.hydration > 0) {
    plant.hydration += 0.1;
    plant.hydration = Math.min(1.0, plant.hydration);
    plant.happy();
  }
});

// TODO
function SaveImage() {
  var image = plant.scene.renderer.domElement.toDataURL('image/png').replace('image/png', 'image/octet-stream');
  window.location.href = image;
}

function render(time) {
  plant.update();
  plant.scene.render();
  requestAnimationFrame(render);
  var delta = clock.getDelta();
  if (plant.mixer != null) {
    plant.mixer.update(delta);
  };
  TWEEN.update(time);
}
render();
