import "./style.css"
import { BufferAttribute, DirectionalLight, DoubleSide, FlatShading, Mesh, MeshPhongMaterial, PerspectiveCamera, PlaneGeometry, Raycaster, Scene, WebGLRenderer } from 'three';
import { GUI } from "dat.gui";
// for moving around with mouse
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls'
// for animating hover
import gsap from "gsap";
// for tweaking controls
const gui = new GUI();
// add properties that needs to be edited to this object
const world = {
  plane: {
    width: 24,
    height: 24,
    widthSegment: 25,
    heightSegment: 25
  }
};

// function to generate plane
const generatePlane = () => {
  // update mesh geometry with new values
  mesh.geometry.dispose();
  mesh.geometry = new PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegment, world.plane.heightSegment);
  addNoise(mesh);

  let colors = [];
  for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
    colors.push(0.19, 0.4, 0);
  }
  // add custom colors to mesh
  mesh.geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
}


// add it to gui and add trigger functions
gui.add(world.plane, 'width', 1, 30)
  .onChange(generatePlane);

gui.add(world.plane, 'height', 1, 30)
  .onChange(generatePlane);

gui.add(world.plane, 'widthSegment', 1, 30)
  .onChange(generatePlane);

gui.add(world.plane, 'heightSegment', 1, 30)
  .onChange(generatePlane);



// add noise to mesh's z values
const addNoise = (m) => {
  const { array } = m.geometry.attributes.position;
  for (let i = 0; i < array.length; i += 3) {
    const x = array[i];
    const y = array[i + 1];
    const z = array[i + 2];

    array[i + 2] = z + (Math.random() * 0.6);
  }
}

const rayCaster = new Raycaster();
const scene = new Scene();
const camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new WebGLRenderer();

renderer.setSize(innerWidth, innerHeight);
// mac's juice
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);


// create the geometry/wireframe
const planeGeom = new PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegment, world.plane.heightSegment);
// create the material
// phong material can't be seen without light so add light
const material = new MeshPhongMaterial({ side: DoubleSide, flatShading: FlatShading, vertexColors: true });

// combine both of them in a Mesh
const mesh = new Mesh(planeGeom, material);
addNoise(mesh);
// add the mesh to scene
scene.add(mesh);

let colors = [];
for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
  colors.push(0.19, 0.4, 0);
}
// add custom colors to mesh
mesh.geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));


// add light to the scene
// directional light
const light = new DirectionalLight(0xffffff, 1);
const light1 = new DirectionalLight(0xffffff, 1);
light.position.set(0, 0, 1);
light1.position.set(0, 0, -1);
scene.add(light);
scene.add(light1);

const controls = new OrbitControls(camera, renderer.domElement);
// move camera from middle to a little backwards on z axis so it can see the mesh in middle
camera.position.z = 5;

const mouse = {
  x: undefined,
  y: undefined
}

// create animation loop
const animate = () => {
  // rerender scene
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  rayCaster.setFromCamera(mouse, camera);
  const intersects = rayCaster.intersectObject(mesh);
  if (intersects.length > 0) {
    console.log("in")
    const { color } = intersects[0].object.geometry.attributes;

    intersects[0].object.geometry.attributes.color.needsUpdate = true;

    const initialColor = {
      r: 0.19,
      g: 0.4,
      b: 0
    }

    const hoverColor = {
      r: 0.2,
      g: 0.24,
      b: 0.1
    }


    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      duration: 1,
      onUpdate: () => {
        // Vertex 1
        color.setX(intersects[0].face.a, hoverColor.r);
        color.setY(intersects[0].face.a, hoverColor.g);
        color.setZ(intersects[0].face.a, hoverColor.b);

        // Vertex 1
        color.setX(intersects[0].face.b, hoverColor.r);
        color.setY(intersects[0].face.b, hoverColor.g);
        color.setZ(intersects[0].face.b, hoverColor.b);

        // Vertex 1
        color.setX(intersects[0].face.c, hoverColor.r);
        color.setY(intersects[0].face.c, hoverColor.g);
        color.setZ(intersects[0].face.c, hoverColor.b);

        color.needsUpdate = true;
      }
    })
  }
}

animate();

window.addEventListener('mousemove', (event) => {
  // normalize coordinates according to threejs
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
})
