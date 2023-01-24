import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

import gsap from 'gsap';

import Stats from 'three/examples/jsm/libs/stats.module.js';


import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';



// stats
const stats = new Stats();
document.body.appendChild(stats.dom);



class LightGroup {
    constructor(color, x, y, z) {
        this.group = new THREE.Group()
        this.group.position.set(x, y, z)

        this.light = new THREE.RectAreaLight(color, 2, 5, 7.5)
        this.light.position.set(0, 5, -4.999)
        this.group.add(this.light)

        this.lightOverlay = new THREE.Mesh(
            new THREE.PlaneGeometry(4.9, 7.4),
            new THREE.MeshBasicMaterial({ color: '#000', opacity: 1, transparent: true })
        )
        this.lightOverlay.position.set(0, 5, -4.99)
        this.group.add(this.lightOverlay)

        this.diamond = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 4, 1),
            new THREE.MeshBasicMaterial({ color: color })
        )
        this.diamond.position.set(0, 2.5, -2)
        this.diamond.rotation.y = Math.PI / 4
        this.group.add(this.diamond)

        // add an invisble div always covering the light using css 3d renderer
        // this.div = document.createElement('div')
        // this.div.style.width = '100px'
        // this.div.style.height = '100px'
        // this.div.style.position = 'absolute'
        // this.div.style.top = '0'
        // this.div.style.left = '0'
        // this.div.style.zIndex = '100'
        // this.div.style.background = 'transparent'
        // this.div.style.pointerEvents = 'none'
        // document.body.appendChild(this.div)

        //         this.plane = new THREE.Mesh(
        //             new THREE.PlaneGeometry(5, 7.5),
        //             new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 1, transparent: true })
        //         );
        //         this.plane.name = name;

        //         this.plane.position.set(x, y, z);
        //         this.plane.rotation.set(0, 0, 0);
        //         this.plane.lookAt(camera.position);
        //         scene.add(this.plane);

        //         this.labelDiv = document.createElement('div');
        //         this.labelDiv.className = 'hs-label magnetic-wrap';
        //         this.labelDiv.textContent = name;
        //         this.labelDiv.setAttribute("data-spot", name);
        //         this.labelDiv.style.marginTop = '-1em';

        //         this.labelDiv.innerHTML = `
        //         <div class="magnetic">
        //             <div class="c">
        //                 <i data-feather="plus" stroke-width="1.5"></i>
        //             </div>
        //         </div>
        //     `;

        //         this.label = new CSS2DObject(this.labelDiv);
        //         this.label.position.set(this.plane.position.x, this.plane.position.y, this.plane.position.z);
        //         scene.add(this.label);

    }
}



let scene,
    camera,
    renderer;



// css3d renderer
// const labelRenderer = new CSS3DRenderer();
// labelRenderer.setSize(window.innerWidth, window.innerHeight);
// labelRenderer.domElement.style.position = 'absolute';
// labelRenderer.domElement.style.top = 0;
// document.body.appendChild(labelRenderer.domElement);



scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
renderer = new THREE.WebGLRenderer({
    antialias: true,
    ShaderPass: true,
    RenderPass: true,
    EffectComposer: true,
    UnrealBloomPass: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const textureLoader = new THREE.TextureLoader();
const floorRoughtnessMap = textureLoader.load('/assets/threeD/green_metal_rust_rough_4k.jpg');
const floorDisplacementMap = textureLoader.load('/assets/threeD/green_metal_rust_disp_4k.png');
const floorDiffuseMap = textureLoader.load('/assets/threeD/green_metal_rust_diff_4k.jpg');


const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = -1;
bloomPass.strength = 1;
bloomPass.radius = 1;

const composer = new EffectComposer(renderer);
composer.setSize(window.innerWidth, window.innerHeight);
composer.addPass(renderScene);
composer.addPass(bloomPass);





const ambientLight = new THREE.AmbientLight(0xffffff, 0.005)
    // scene.add(ambientLight)



const planeGeometry = new THREE.PlaneGeometry(100, 15, 10, 10);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });
const wall = new THREE.Mesh(planeGeometry, planeMaterial);
wall.position.z = -5;
wall.position.y = 5;
scene.add(wall);


const lightPurple = new LightGroup('#4e00ff', -10, 0, 0)
scene.add(lightPurple.group)

const lightOrange = new LightGroup('#ff4d00', 0, 0, 0)
scene.add(lightOrange.group)

const lightGreen = new LightGroup('#00ff00', 10, 0, 0)
scene.add(lightGreen.group)


const floorGroup = new THREE.Group()

const floorGeometry = new THREE.PlaneGeometry(100, 10, 1, 1);
const floorMaterial = new THREE.MeshPhysicalMaterial({
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
});
const floor = new Reflector(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floorGroup.add(floor);

const floorOverlay = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 10, 1000, 1000),
    new THREE.MeshStandardMaterial({
        color: 0x000000,
        opacity: .75,
        transparent: true,
        roughnessMap: floorRoughtnessMap,
        displacementMap: floorDisplacementMap,
        displacementScale: .5,
        map: floorDiffuseMap,
    })
)

floorOverlay.geometry.setAttribute('uv2', new THREE.BufferAttribute(floorOverlay.geometry.attributes.uv.array, 2));
floorOverlay.position.set(0, 0.1, 0)
floorOverlay.rotation.x = -Math.PI / 2;
floorGroup.add(floorOverlay)

scene.add(floorGroup)



var mouse = new THREE.Vector2();
var target = new THREE.Vector2();
var windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);

document.addEventListener('mousemove', onMouseMove, false);

function onMouseMove(event) {
    mouse.x = (event.clientX - windowHalf.x);
    mouse.y = (event.clientY - windowHalf.x);
}

camera.position.y = 3;
camera.position.z = 5;







// reize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})



function animate() {
    requestAnimationFrame(animate);

    stats.begin();
    stats.end();

    target.x = (1 - mouse.x) * 0.0001;
    target.y = (1 - mouse.y) * 0.0001;

    camera.rotation.x += 0.05 * (target.y - camera.rotation.x);
    camera.rotation.y += 0.05 * (target.x - camera.rotation.y);


    lightPurple.diamond.rotation.x += 0.01;
    lightPurple.diamond.rotation.y += 0.01;
    lightPurple.diamond.rotation.z += 0.01;
    lightPurple.diamond.position.y = Math.sin(Date.now() * 0.001) * 0.5 + 2.5;

    lightGreen.diamond.rotation.x += 0.01;
    lightGreen.diamond.rotation.y += 0.01;
    lightGreen.diamond.rotation.z += 0.01;
    lightGreen.diamond.position.y = Math.sin(Date.now() * 0.0012) * 0.5 + 2.5;

    lightOrange.diamond.rotation.x += 0.01;
    lightOrange.diamond.rotation.y += 0.01;
    lightOrange.diamond.rotation.z += 0.01;
    lightOrange.diamond.position.y = Math.sin(Date.now() * 0.0014) * 0.5 + 2.5;


    // get random value between 0 and 1


    // update labelrenderer
    //     labelRenderer.render(scene, camera);


    //     renderer.render(scene, camera);
    composer.render();
}
animate();


// throttle wheel

function onWheel(e) {
    // get the direction of the scroll and value
    const direction = e.deltaY > 0 ? 1 : -1;
    const value = Math.abs(e.deltaY);



    // move camera based on direction and value
    if (direction === 1) {
        camera.position.x += value * 0.0025;
        // camera.rotation.z = value * 0.00005;
    }
    if (direction === -1) {
        camera.position.x -= value * 0.0025;
        // camera.rotation.z = -(value * 0.00005);
    }

}

window.addEventListener('wheel', onWheel, false);





const tl = new gsap.timeline()

tl.fromTo(camera.position, {
    z: 100,
}, {
    duration: 5,
    z: 5,
    ease: "expo.inOut"
})