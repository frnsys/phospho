import * as THREE from 'three';
import OrbitControls from './orbit.js';

const VIEW_ANGLE = 45;
const NEAR = 0.1;
const FAR = 10000;


class Scene {
  constructor(opts) {
    opts.enableControls = opts.enableControls == undefined ? true : opts.enableControls;
    opts.width = opts.width || window.innerWidth;
    opts.height = opts.height || window.innerHeight;
    this.opts = opts;

    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({antialias: false, alpha: true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(opts.width, opts.height);
    this.renderer.setClearColor(0xeeeeee, 0);
    document.body.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      VIEW_ANGLE,
      opts.width/opts.height,
      NEAR,
      FAR);
    this.camera.position.z = 600;

    if (opts.enableControls) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableRotate = true;
      // for orthographic
      // this.controls.maxZoom = 0.4;
      // this.controls.minZoom = 0.02;
      // for perspective
      this.controls.minDistance = 400;
      this.controls.maxDistance = 1200;
    }

    window.addEventListener('resize', () => {
      this.camera.aspect = opts.width/opts.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(opts.width, opts.height);
    }, false);
  }

  add(mesh) {
    this.scene.add(mesh);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

export default Scene;
