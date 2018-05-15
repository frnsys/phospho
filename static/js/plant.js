import Scene from './scene.js';
import GLTFLoader from './gltf.js';

const OBJ_MASS = 10;
const loader = new GLTFLoader();

function makeWall(pos, rot) {
  let body = new CANNON.Body({
      mass: 0, // mass == 0 makes the body static
      position: new CANNON.Vec3(pos.x, pos.y, pos.z),
      shape: new CANNON.Plane()
  });
  body.quaternion.setFromEuler(rot.x, rot.y, rot.z);
  return body;
}

class Collection {
  constructor() {
    this.scene = new Scene({
      enableControls: true
    });
    this.objs = [];
    this.phys = {};
    this.loaded = {};

    // setup box
    let [w, h] = [25, 40];

    // floor
    this.scene.world.addBody(makeWall({x:0, y:-h/2, z:0}, {x:-Math.PI/2, y:0, z:0}));

    // ceil
    this.scene.world.addBody(makeWall({x:0, y:h/2, z:0}, {x:Math.PI/2, y:0, z:0}));

    // right wall
    this.scene.world.addBody(makeWall({x:w/2, y:0, z:0}, {x:0, y:-Math.PI/2, z:0}));

    // left wall
    this.scene.world.addBody(makeWall({x:-w/2, y:0, z:0}, {x:0, y:Math.PI/2, z:0}));

    // back wall
    this.scene.world.addBody(makeWall({x:0, y:0, z:-w/2}, {x:0, y:0, z:0}));

    // front wall
    this.scene.world.addBody(makeWall({x:0, y:0, z:w/2}, {x:-Math.PI, y:0, z:0}));

    // TESTING spawn random models
    let models = ['plant', 'water_drop', 'beef', 'milk', 'bread', 'orange', 'pet_food', 'peas'];
    for (let i=0; i<100; i++) {
      let model = models[Math.floor(Math.random() * models.length - 1)];
      this.loadModel(`/static/models/${model}.gltf`, {x: 10, y: 10, z: 10});
    }
  }

  setupModel(model, pos) {
    if (model.material) {
      model.material.color = {
        r: 1,
        g: 1,
        b: 1
      };
    }
    model.children.forEach((c) => {
      c.material.color = {
        r: 1,
        g: 1,
        b: 1
      };
      c.material.side = THREE.DoubleSide;
    });
    model.position.set(pos.x, pos.y, pos.z);
    this.scene.add(model);

    // setup physics box
    let bbox = new THREE.Box3().setFromObject(model);
    let x = (bbox.max.x - bbox.min.x)/2;
    let y = (bbox.max.y - bbox.min.y)/2;
    let z = (bbox.max.z - bbox.min.z)/2;

    let shape = new CANNON.Box(new CANNON.Vec3(x,y,z));
    let body = new CANNON.Body({
      mass: OBJ_MASS
    });
    body.addShape(shape);
    this.scene.world.addBody(body);

    // let shapeBox = new THREE.BoxBufferGeometry(
    //   shape.halfExtents.x*2,
    //   shape.halfExtents.y*2,
    //   shape.halfExtents.z*2);
    // let shapeMesh = new THREE.Mesh(shapeBox, new THREE.MeshBasicMaterial());
    // this.scene.add(shapeMesh);

    this.objs.push(model);
    this.phys[model.uuid] = body;
  }

  loadModel(path, pos) {
    if (path in this.loaded) {
      this.setupModel(this.loaded[path].clone(), pos);
    } else {
      loader.load(path, (gltf) => {
        let child = gltf.scene.children[0];
        this.setupModel(child, pos);
        this.loaded[path] = child;
      });
    }
  }
}

let plant_el = document.getElementById('plant-model');
let plant = new Collection();
plant_el.appendChild(plant.scene.renderer.domElement);

function render(time) {
  plant.scene.render();
  plant.objs.forEach((obj) => {
    let physbox = plant.phys[obj.uuid];
    obj.position.copy(physbox.position);
    obj.quaternion.copy(physbox.quaternion);
  });
  requestAnimationFrame(render);
}
render();
