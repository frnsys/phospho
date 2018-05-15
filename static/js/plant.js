import Scene from './scene.js';
import GLTFLoader from './gltf.js';

Physijs.scripts.worker = '/static/lib/physijs/physijs_worker.js';
Physijs.scripts.ammo = '/static/lib/physijs/examples/js/ammo.js';

const OBJ_MASS = 10;
const OBJ_SCALE = 50;
const loader = new GLTFLoader();

class Collection {
  constructor() {
    this.scene = new Scene({
      enableControls: true
    });
    this.objs = [];
    this.phys = {};

    let [w, h] = [1000, 2000];
    let capGeo = new THREE.PlaneGeometry(w, w, 1, 1);
    let floor = new Physijs.PlaneMesh(capGeo);
    floor.rotation.set(-Math.PI/2, 0, 0);
    floor.position.set(0, -h/2, 0);
    this.scene.add(floor);

    let ceil = new Physijs.PlaneMesh(capGeo);
    ceil.rotation.set(Math.PI/2, 0, 0);
    ceil.position.set(0, h/2, 0);
    this.scene.add(ceil);

    let wallGeo = new THREE.PlaneGeometry(w, h, 1, 1);
    let wall = new Physijs.PlaneMesh(wallGeo);
    wall.rotation.set(0, -Math.PI/2, 0);
    wall.position.set(w/2, 0, 0);
    this.scene.add(wall);

    let lwall = new Physijs.PlaneMesh(wallGeo);
    lwall.rotation.set(0, Math.PI/2, 0);
    lwall.position.set(-w/2, 0, 0);
    this.scene.add(lwall);

    let bwall = new Physijs.PlaneMesh(wallGeo);
    bwall.rotation.set(0, 0, 0);
    bwall.position.set(0, 0, -w/2);
    this.scene.add(bwall);

    let fwall = new Physijs.PlaneMesh(wallGeo);
    fwall.rotation.set(-Math.PI, 0, 0);
    fwall.position.set(0, 0, w/2);
    this.scene.add(fwall);

    this.scene.scene.addEventListener(
      'update', () => {
        this.objs.forEach((obj) => {
          let physbox = this.phys[obj.uuid];
          obj.position.set(physbox.position.x, physbox.position.y, physbox.position.z);
          obj.rotation.set(physbox.rotation.x, physbox.rotation.y, physbox.rotation.z);
        });
      }
    );

    this.loadModel('/static/models/plant.gltf', {x: 10, y: 10, z: 10});
    this.loadModel('/static/models/water_drop.gltf', {x: 20, y: 20, z: 20});
    this.loadModel('/static/models/beef.gltf', {x: 20, y: 20, z: 20});
  }

  loadModel(path, pos) {
    loader.load(path, (gltf) => {
      let child = gltf.scene.children[0];
      child.scale.set(OBJ_SCALE, OBJ_SCALE, OBJ_SCALE);
      child.children.forEach((c) => {
        c.material.color = {
          r: 1,
          g: 1,
          b: 1
        };
        c.material.side = THREE.DoubleSide;
      });
      child.position.set(pos.x, pos.y, pos.z);
      this.scene.add(child);

      // setup physics box
      let bbox = new THREE.Box3().setFromObject(child);
      let x = bbox.max.x - bbox.min.x;
      let y = bbox.max.y - bbox.min.y;
      let z = bbox.max.z - bbox.min.z;
      let physbox = new Physijs.BoxMesh(new THREE.BoxGeometry(x, y, z), new THREE.MeshBasicMaterial(), OBJ_MASS);
      physbox.visible = false;
      physbox.position.set(pos.x, pos.y, pos.z);
      this.scene.add(physbox);

      this.objs.push(child);
      this.phys[child.uuid] = physbox;
    });
  }
}

let plant_el = document.getElementById('plant-model');
let plant = new Collection();
plant_el.appendChild(plant.scene.renderer.domElement);

function render(time) {
  plant.scene.render();
  requestAnimationFrame(render);
}
render();
