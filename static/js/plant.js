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
      enableControls: false
    });
    this.objs = [];
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
    for (let i=0; i<20; i++) {
      let model = models[Math.floor(Math.random() * models.length - 1)];
      this.loadModel(`/static/models/${model}.gltf`, {x: 10, y: 10, z: 10});
    }

    this.selected = null;
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.scene.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this), false);
    this.scene.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    this.scene.renderer.domElement.addEventListener('touchstart', this.onTouchStart.bind(this), false);
    this.scene.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
  }

  updateMouse(ev) {
    // adjust browser mouse position for three.js scene
    this.mouse.x = (ev.clientX/this.scene.renderer.domElement.clientWidth) * 2 - 1;
    this.mouse.y = -(ev.clientY/this.scene.renderer.domElement.clientHeight) * 2 + 1;
  }

  onTouchStart(ev) {
    ev.preventDefault();
    ev.clientX = ev.touches[0].clientX;
    ev.clientY = ev.touches[0].clientY;
    this.onMouseDown(ev);
  }

  onMouseDown(ev) {
    ev.preventDefault();
    this.updateMouse(ev);
    this.raycaster.setFromCamera(this.mouse, this.scene.camera);

    var intersects = this.raycaster.intersectObjects(this.objs);
    if (intersects.length > 0) {
      var obj = intersects[0].object,
          pos = intersects[0].point;
      this.selected = obj;
      this.selected.body.mass = 0;
      this.selected.body.velocity.set(0,0,0);
    }
  }

  onMouseUp(ev) {
    ev.preventDefault();
    if (this.selected) {
      this.selected.body.mass = OBJ_MASS;
      this.selected = null;
    }
  }

  onMouseMove(ev) {
    if (this.selected) {
      this.updateMouse(ev);
      this.raycaster.setFromCamera(this.mouse, this.scene.camera);
      var pos = this.raycaster.ray.origin;
      this.selected.position.x = pos.x;
      this.selected.position.y = pos.y;
      this.selected.body.position.x = pos.x;
      this.selected.body.position.y = pos.y;
      this.selected.body.velocity.set(0,0,0);
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
    model.body = body;
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
    obj.position.copy(obj.body.position);
    obj.quaternion.copy(obj.body.quaternion);
  });
  requestAnimationFrame(render);
}
render();
