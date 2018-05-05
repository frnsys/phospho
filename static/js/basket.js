import Scene from './scene.js';
import GLTFLoader from './gltf.js';

const ITEM_WIDTH = 200;
const ITEM_HEIGHT = 200;
const ITEM_SCALE = 150;
const loader = new GLTFLoader();
const models = [];
const scenes = [];

function addModel(scene, scale, cb){
  return (gltf) => {
    let child = gltf.scene.children[0];
    child.scale.set(scale, scale, scale);
    child.rotation.z += 0.5;
    child.material.color = {
      r: 1,
      g: 1,
      b: 1
    };
    scene.add(child);
    models.push(child);
    cb(child);
  }
}

class BasketItem {
  constructor(modelPath, scale) {
    scale = scale || ITEM_SCALE;
    this.scene = new Scene({
      enableControls: false,
      width: ITEM_WIDTH,
      height: ITEM_HEIGHT
    });
    scenes.push(this.scene);

    loader.load(modelPath, addModel(this.scene, scale, (obj) => {
      obj.position.y = 0;
      obj.position.x = 0;
    }));
  }
}

Array.from(document.querySelectorAll('.grid li')).forEach((el) => {
  let scale = parseInt(el.dataset.scale) || ITEM_SCALE;
  let item = new BasketItem(el.dataset.model, scale);
  el.appendChild(item.scene.renderer.domElement);
});

function render() {
  scenes.forEach((s) => s.render());
  models.forEach((m) => {
    m.rotation.y += 0.02;
  });
  requestAnimationFrame(render);
}
render();
