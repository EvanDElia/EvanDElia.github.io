import './style.less'
import { gsap } from "gsap"
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

import waterVertexShader from './shaders/vertex.glsl'
import waterFragmentShader from './shaders/fragment.glsl'


let pointer = {x: 0, y: 0};
const mobile = (window.innerWidth <= 1370);

function calcOffset(xPos, yPos) {
    let winW = window.innerWidth;
    let winH = window.innerHeight/1.3;
    let dX = 2*(xPos - winW/2)/winW;
    let dY = -2*(yPos - winH/2)/winH + 1;
    return [dX,dY];
}

function rotateTxt(xPos, yPos) {
    if (!window.stopAnimating) {
        let nPos = calcOffset(xPos, yPos);
        let nX = nPos[0];
        let nY = nPos[1];
        gsap.to("#landing", 0.4, {
        rotationX: nY*30,
        rotationY: nX*50,
        rotation: nX*40,
        }); 
    } else {
        gsap.to("#landing", 0.5, {
            rotationX: 0,
            rotationY: 0,
            rotation: 0,
            ease: "elastic.out(3, 0.75)"
        });
    }
}

var mouseListener = function(event) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    rotateTxt(pointer.x, pointer.y);
}

if (!mobile)
    window.addEventListener("mousemove", mouseListener);

const textParams = [
    {
        top: '150px',
        fontSize: '370px',
        text: 'Doja Cat'
    },
    {
        top: '180px',
        fontSize: '350px',
        text: 'adult swim'
    },
    {
        top: '180px',
        fontSize: '350px',
        text: '[as] music'
    },
    {
        top: '250px',
        fontSize: '260px',
        text: 'Neon Night'
    },
    {
        top: '250px',
        fontSize: '260px',
        text: 'Ocean World'
    }
]

if (!mobile) {
    document.querySelectorAll('.hello')[0].style.fontSize = '650px';
    document.querySelectorAll('.hello')[0].style.top = '0px';
} else {
    document.querySelectorAll('.hello')[0].style.fontSize = '42vw';
}
document.querySelectorAll('.hello')[0].style.opacity = 0.333;

document.querySelectorAll('.project').forEach((el, id) => {
    el.onmouseleave = function() {
        document.querySelectorAll('.hello')[0].innerText = 'Hello';
        if (!mobile) {
            document.querySelectorAll('.hello')[0].style.fontSize = '650px';
            document.querySelectorAll('.hello')[0].style.top = '0px';
        } else {
            document.querySelectorAll('.hello')[0].style.fontSize = '42vw';
        }
        document.querySelectorAll('.hello')[0].style.opacity = 0.333;
        window.stopAnimating = false;
    }
    el.onmouseover = function() {
        document.querySelectorAll('.hello')[0].innerText = textParams[id].text;
        if (!mobile) {
            document.querySelectorAll('.hello')[0].style.fontSize = textParams[id].fontSize;
            document.querySelectorAll('.hello')[0].style.top = textParams[id].top;
        } else {
            document.querySelectorAll('.hello')[0].style.fontSize = '22vw';
        }
        document.querySelectorAll('.hello')[0].style.opacity = 1;
        window.stopAnimating = true;
    }
})

/**
 * Base
 */
// Debug
const params = new URLSearchParams(window.location.search);
let gui;
if (params.has('secret') || params.has('gui') || params.has('debug'))
    gui = new dat.GUI({ width: 640 })
const debugObject = {}
debugObject.depthColor = '#59798e'
debugObject.surfaceColor = '#124866'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(2, 2, 512, 512)

// Material
const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    uniforms: {
        uTime: {value: 0},
        uBigWaveElevation: {value: 0.2},
        uBigWaveFrequency: {value: new THREE.Vector2(4, 1.3)},
        uBigWaveSpeed: { value: 0.75},
        uSmallWaveElevation: {value: 0.15},
        uSmallWaveFrequency: {value: 3 },
        uSmallWaveSpeed: { value: 0.2},
        uSmallWaveIterations: {value: 4 },
        uColorOffset: {value: 0.08},
        uColorMultiplier: {value: 5.},
        uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) }
    }
})

//Debug
if (params.has('secret') || params.has('gui') || params.has('debug')) {
    gui.add(waterMaterial.uniforms.uBigWaveElevation, 'value').min(0).max(1).step(0.001).name('BigWaveElevation')
    gui.add(waterMaterial.uniforms.uBigWaveFrequency.value, 'x').min(0).max(5).step(0.01).name('BigWaveFreqX')
    gui.add(waterMaterial.uniforms.uBigWaveFrequency.value, 'y').min(0).max(5).step(0.01).name('BigWaveFreqY')
    gui.add(waterMaterial.uniforms.uBigWaveSpeed, 'value' ).min(0).max(5).step(0.01).name('BigWaveSpeed')
    gui.addColor(debugObject, 'depthColor').onChange(() => { waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor) })
    gui.addColor(debugObject, 'surfaceColor').onChange(() => { waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor) })
    gui.add(waterMaterial.uniforms.uColorOffset, 'value' ).min(0).max(5).step(0.01).name('ColorOffset')
    gui.add(waterMaterial.uniforms.uColorMultiplier, 'value' ).min(0).max(5).step(0.01).name('ColorMultiplier')

    gui.add(waterMaterial.uniforms.uSmallWaveElevation, 'value').min(0).max(1).step(0.001).name('SmallWaveElevation')
    gui.add(waterMaterial.uniforms.uSmallWaveSpeed, 'value').min(0).max(5).step(0.01).name('SmallWaveSpeed')
    gui.add(waterMaterial.uniforms.uSmallWaveFrequency, 'value').min(0).max(5).step(0.01).name('SmallWaveFreq')
    gui.add(waterMaterial.uniforms.uSmallWaveIterations, 'value' ).min(0).max(5).step(1).name('SmallWaveIterations')

    gui.close();
}



// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5
scene.add(water)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    //Upadte composer
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    effectComposer.setSize(sizes.width, sizes.height)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1, 0.5, -1)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 1.5
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//post processing

let RenderTargetClass = null

if(renderer.getPixelRatio() === 1 && renderer.capabilities.isWebGL2)
{
    RenderTargetClass = THREE.WebGLMultisampleRenderTarget
    console.log('Using WebGLMultisampleRenderTarget')
}
else
{
    RenderTargetClass = THREE.WebGLRenderTarget
    console.log('Using WebGLRenderTarget')
}

const renderTarget = new RenderTargetClass(
    800,
    600,
    {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        encoding: THREE.sRGBEncoding
    }
)


const effectComposer = new EffectComposer(renderer, renderTarget)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
effectComposer.setSize(sizes.width, sizes.height)

const renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass)

// Dot Screen Pass
const dotScreenShader = {
    uniforms: {
        'tDiffuse': {
            value: null
        },
        'tSize': {
            value: new THREE.Vector2( 256, 256 )
        },
        'center': {
            value: new THREE.Vector2( 0.5, 0.5 )
        },
        'angle': {
            value: 1.57
        },
        'scale': {
            value: 4
        }
    },
    vertexShader: `
        varying vec2 vUv;

        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);

            vUv = uv;
        }
    `,
    fragmentShader: `

    uniform vec2 center;
    uniform float angle;
    uniform float scale;
    uniform vec2 tSize;

    uniform sampler2D tDiffuse;

    varying vec2 vUv;

    float pattern() {

        float s = sin( angle ), c = cos( angle );

        vec2 tex = vUv * tSize - center;
        vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;

        return ( sin( point.x ) * sin( point.y ) ) * 4.0;

    }

    void main() {

        vec4 color = texture2D( tDiffuse, vUv );

        float average = ( color.r + color.g + color.b ) / 1.0;

        gl_FragColor = vec4( color.rgb * (average * 10.0 - 5.0 + pattern()), color.a );
        //gl_FragColor = vec4( vec3(color.rgb - pattern()), color.a);

    }`
}

const dotScreenPass = new ShaderPass(dotScreenShader)
if (!mobile) effectComposer.addPass(dotScreenPass)

RGBShiftShader.uniforms.amount.value = 0.0025;
RGBShiftShader.uniforms.angle.value = 0.121;
const rgbShiftPass = new ShaderPass(RGBShiftShader)
rgbShiftPass.enabled = !mobile;
effectComposer.addPass(rgbShiftPass)

const unrealBloomPass = new UnrealBloomPass()
unrealBloomPass.strength = 0.1;
unrealBloomPass.radius = 1;
unrealBloomPass.threshold = 0.6;
effectComposer.addPass(unrealBloomPass)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    waterMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // camera.position.set(Math.cos(elapsedTime) + 1, 1, Math.sin(elapsedTime) + 1)

    // Render
    // renderer.render(scene, camera)
    effectComposer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()