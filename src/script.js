import './style.less'
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

function isMobile() {
    if ('maxTouchPoints' in navigator) return navigator.maxTouchPoints > 0;

    const mQ = matchMedia?.('(pointer:coarse)');
    if (mQ?.media === '(pointer:coarse)') return !!mQ.matches;
    
    if ('orientation' in window) return true;
    
    return /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(navigator.userAgent) ||
      /\b(Android|Windows Phone|iPad|iPod)\b/i.test(navigator.userAgent);
}

const mobile = isMobile();

const textParams = [
    {
        fontSize: '100px',
        image: 'slosh.jpg',
        text: 'Slosh Seltzer'
    },
    {
        fontSize: '100px',
        image: 'thefield.jpg',
        text: 'WSJ: The Field'
    },
    {
        fontSize: '100px',
        image: 'pepsi-dance.jpg',
        text: 'Pepsi'
    },
    {
        fontSize: '100px',
        image: 'dreamwave.jpg',
        text: 'Dreamwave'
    },
    {
        fontSize: '100px',
        image: 'soundwaves.png',
        text: 'SXSW'
    },
    {
        fontSize: '100px',
        image: 'espn.jpg',
        text: 'ESPN Fifty50'
    },
    {
        fontSize: '100px',
        image: 'doja.jpg',
        text: 'Doja Cat'
    },
    {
        fontSize: '100px',
        image: 'adultswimdotcom.jpg',
        text: '[adult swim]'
    },
    {
        fontSize: '100px',
        image: 'asmusic.jpg',
        text: '[as] music'
    },
    {
        fontSize: '100px',
        image: 'neonnight.jpg',
        text: 'Neon Night'
    },
    {
        fontSize: '100px',
        image: 'oceanworld.jpg',
        text: 'Ocean World'
    }
]

if (!mobile)
document.querySelectorAll('.project').forEach((el, id) => {
    el.onmouseleave = function() {
        document.querySelectorAll('.hello')[0].innerText = '';
        if (!mobile) {
            document.querySelectorAll('.hello')[0].style.top = '0px';
            document.querySelectorAll('.poster')[0].style.opacity = 0;
        } else {
            document.querySelectorAll('.hello')[0].style.fontSize = '42vw';
        }
        document.querySelectorAll('.hello')[0].style.opacity = 0;
        window.stopAnimating = false;
        document.querySelectorAll('.headings')[0].classList.remove('hovering');
    }
    el.onmouseover = function() {
        document.querySelectorAll('.hello')[0].innerText = textParams[id].text;
        if (!mobile) {
            document.querySelectorAll('.hello')[0].style.fontSize = textParams[id].fontSize;
            document.querySelectorAll('.poster')[0].style.opacity = 0.65;
            document.querySelectorAll('.hello')[0].style.top = `${110 + id * 20}px`;
            document.querySelectorAll('.poster')[0].style.top = `${30 + id * 20}px`;
            document.querySelectorAll('.poster__image')[0].src = `https://evandelia.com/img/${textParams[id].image}`;
        } else {
            document.querySelectorAll('.hello')[0].style.fontSize = '22vw';
        }
        document.querySelectorAll('.hello')[0].style.opacity = 1;
        window.stopAnimating = true;
        document.querySelectorAll('.headings')[0].classList.add('hovering');
    }
})

document.querySelectorAll('.copyright')[0].innerText += ` ${new Date().getFullYear()}`;

setTimeout(() => {
    document.getElementById('nameBox').style.opacity = 1;
    document.body.style.opacity = 1;
    // document.querySelectorAll('.main')[0].style['mix-blend-mode'] = 'difference';

    console.log('%c Hey what are you doing looking at the code for my site?', 'background: #f22; color: #bada55');
console.log('%c Well here are some hidden links on the adultswim website that the company never took down if that kind of thing interests you ;)', 'background: #000; color: #fff');
console.log('%c https://www.adultswim.com/misc/not-a-link/', 'background: #000; color: #fff');
console.log('%c https://www.adultswim.com/misc/primal-backgrounds/', 'background: #000; color: #fff');
console.log('%c https://www.adultswim.com/misc/eric-andre-hot-babes-of-instagram/', 'background: #000; color: #fff');
}, 10)

/**
 * Base
 */
// Debug
const params = new URLSearchParams(window.location.search);
let gui;
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
        uSmallWaveIterations: {value: 3 },
        uColorOffset: {value: 0.08},
        uColorMultiplier: {value: 5.},
        uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) }
    }
})

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
camera.position.set(1.2, 0.26, 0)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    powerPreference: 'high-performance'
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

const dotScreenPass = new ShaderPass(dotScreenShader);
if (!mobile) effectComposer.addPass(dotScreenPass);

RGBShiftShader.uniforms.amount.value = 0.0039;
RGBShiftShader.uniforms.angle.value = 0.121;
const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.enabled = !mobile;
effectComposer.addPass(rgbShiftPass);

const unrealBloomPass = new UnrealBloomPass();
unrealBloomPass.strength = 1.2;
unrealBloomPass.radius = 1;
unrealBloomPass.threshold = 0.5;
// unrealBloomPass.bloomTintColors = [
//     new THREE.Color('deeppink'),
//     new THREE.Color('deeppink'),
//     new THREE.Color('deeppink'),
//     new THREE.Color('deeppink'),
//     new THREE.Color('deeppink')
// ];
effectComposer.addPass(unrealBloomPass);
//dat gui
if (!mobile) {
    gui = new dat.GUI({ width: 640 })

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
    gui.add(unrealBloomPass, 'strength' ).min(0).max(5).step(0.1).name('Bloom Strength')
    gui.close();
}

/**
 * Animate
 */
const clock = new THREE.Clock();

let mousePos =  {
    x: 0,
    y: 0
}
let nextPos = 0;

if (!mobile) {
    window.addEventListener('mousemove', (e) => {
        mousePos.x = e.clientX;
        mousePos.y = e.clientY;
    });

    window.addEventListener('pointerdown', (e) => {
        canvas.style.cursor = 'grabbing';
    });

    window.addEventListener('pointerup', (e) => {
        canvas.style.cursor = 'grab';
    });
}

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();
    waterMaterial.uniforms.uTime.value = elapsedTime;

    // Update controls
    controls.update();

    // camera.position.set(Math.cos((elapsedTime * 0.6)), Math.sin((elapsedTime * 0.6) - 10) * 0.5 + 0.6, Math.sin((elapsedTime * 0.6)))

    // Render
    // renderer.render(scene, camera)
    effectComposer.render();

    nextPos = lerp(nextPos, mousePos.x / 2 - 90, 0.09);
    document.querySelectorAll('.poster__image')[0].style.margin = `0px 0px 0px ${nextPos}px`;

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
}

tick();

function lerp( a, b, alpha ) {
    return a + alpha * ( b - a );
}