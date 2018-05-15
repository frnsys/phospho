import Scene from './scene.js';
import GLTFLoader from './gltf.js';

const OBJ_MASS = 10;
const MOUSE_VEL_SCALE = 2000;
const SPHERE_POS = {x: 0, y: 0, z: -10};
const SPHERE_RAD = 2;
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
      this.loadModel(`/static/models/${model}.gltf`, {x: 10, y: 10, z: 0});
    }

    this.selected = null;
    this.focused = null;
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.mouseVels = [];
    this.scene.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this), false);
    this.scene.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    this.scene.renderer.domElement.addEventListener('touchstart', this.onTouchStart.bind(this), false);
    this.scene.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);

    let sphereGeo = new THREE.SphereBufferGeometry(SPHERE_RAD);
    let sphereMat = new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0.2});
    let sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.copy(SPHERE_POS);
    this.scene.add(sphere);
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

      // clicking focused object
      if (this.selected == this.focused) {
        // eh sort of buggy but ok
        this.selected.scale.set(1.0, 1.0, 1.0);
        this.selected.scale.set(1.2, 1.2, 1.2);
        setTimeout(() => {
          this.selected.scale.set(1, 1, 1);
        }, 500);

        // roughly every 10 clicks
        if (Math.random() < 0.10) {
          if (Math.random() < 0.5) {
            this.loadModel(`/static/models/orange.gltf`, SPHERE_POS);
          } else {
            this.loadModel(`/static/models/beef.gltf`, SPHERE_POS);
          }
        }
      }
    }
  }

  onMouseUp(ev) {
    ev.preventDefault();
    if (this.selected) {
      if (this.selected != this.focused) {
        let vel = this.mouseVels[0];
        if (vel) {
          this.selected.body.velocity.set(vel.x*MOUSE_VEL_SCALE, vel.y*MOUSE_VEL_SCALE, 0);
        }
      }
      this.selected.body.mass = OBJ_MASS;
      this.selected = null;
    }
    if (this.focused) {
      this.focused.body.mass = 0;
      this.focused.position.x = SPHERE_POS.x;
      this.focused.position.y = SPHERE_POS.y;
      this.focused.body.position.x = SPHERE_POS.x;
      this.focused.body.position.y = SPHERE_POS.y;
    }
  }

  onMouseMove(ev) {
    let dt, lastMousePos;
    if (this.lastMouseMove) {
      let now = Date.now();
      dt =  now - this.lastMouseMove;
      lastMousePos = this.mouse.clone();
    }
    this.lastMouseMove = Date.now();
    this.updateMouse(ev);
    if (dt) {
      let xVel = (this.mouse.x - lastMousePos.x)/dt;
      let yVel = (this.mouse.y - lastMousePos.y)/dt;
      this.mouseVels = [{x: xVel, y: yVel}];
    }
    if (this.selected) {
      this.raycaster.setFromCamera(this.mouse, this.scene.camera);
      var pos = this.raycaster.ray.origin;
      this.selected.position.x = pos.x;
      this.selected.position.y = pos.y;
      this.selected.body.position.x = pos.x;
      this.selected.body.position.y = pos.y;
      this.selected.body.velocity.set(0,0,0);

      // setting the "focused" item
      if ((pos.x-SPHERE_POS.x)**2 + (pos.y-SPHERE_POS.y)**2 < SPHERE_RAD**2) {
        if (!this.focused) {
          this.focused = this.selected;
          document.getElementById('selected-name').innerText = this.focused.name;
        }
      } else if (this.focused && this.focused == this.selected) {
        this.focused = null;
        this.selected.scale.set(1, 1, 1);
        document.getElementById('selected-name').innerText = '';
      }
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
      let model = this.loaded[path].clone();
      model.name = path;
      this.setupModel(model, pos);
    } else {
      loader.load(path, (gltf) => {
        let model = gltf.scene.children[0];
        model.name = path;
        this.setupModel(model, pos);
        this.loaded[path] = model;
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

