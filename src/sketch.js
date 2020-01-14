
var THREE = require('three');
var gsap = require('./gsap.js');

module.exports = class Sketch {
  constructor(opts) {
    this.scene = new THREE.Scene();
    this.vertex = `varying vec2 vUv;void main() {vUv = uv;gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}`;
    this.fragment = opts.fragment;
    this.uniforms = opts.uniforms;
    this.renderer = new THREE.WebGLRenderer();
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xeeeeee, 1);
    this.duration = opts.duration || 1.2;
    this.debug = opts.debug || false
    this.easing = opts.easing || 'easeInOut'
    this.descriptions = ['Working on the <a href="https://www.adultswim.com" target="_blank">[adult swim] website</a> has exposed me to a wide range of web technologies and infrastructures. On a daily basis I take care of tasks ranging from backend server updates to frontend builds. I primarily write code in JavaScript, Less, and Pug and use a bundler like webpack or gulp. My preferred frameworks for more complex projects are React and Redux. For the more weird and creative projects I enjoy using Three.js and WebGL as well as other 3D libraries and modeling softwares. During my time of over 4 years at [adult swim] I’ve also had the opportunity to produce some animations for the public <a href="https://www.instagram.com/adultswim"  target="_blank">Instagram account</a> as well as contribute to this <a href="https://www.youtube.com/watch?v=U_a17A3kNlM" target="_blank">exquisite corpse video</a>. Overall, working here has also been an extremely rewarding experience because I know that I am supporting the creation of content that speaks directly to my sensibilities and aesthetics. Check out new content daily <a href="https://www.adultswim.com/streams" target="_blank">here</a>.', 'One of the sections of the [adult swim] website that I am proudest of is the music section. I have worked with inhouse designers and third party creative agencies to create several webpages for album releases where users can stream the album as well as share it to social media. There is also an embeddable music player for each album that news and press affiliates iframe on their website. All released in 2019, I would like to direct you to check out <a href="https://www.adultswim.com/music/hyper-swim" target="_blank">HyperSwim</a> made with Hyperdub, <a href="https://www.adultswim.com/music/ghostly-swim-3" target="_blank">GhostlySwim 3</a> made with Ghostly International, and <a href="https://www.adultswim.com/music/awful-swim" target="_blank">AwfulSwim</a> Awful Records. We also currently have the <a href="https://www.adultswim.com/singles" target="_blank">[adult swim] singles project</a> which releases one new track every week of the year.','For this project I used Three.js to create an interactive experience for Blackbird Blackbird’s EP entitled, Neon Nights. I wanted to make the scenery of this project intertwined with the music itself so using a sound analysis library I tied the skymap of the scene to change every time there is a "beat" defined by the the rate of change in volume over time. The lights which float around the flowers are also tied to the volume level. In addition, you can view this project on a mobile phone to experience the scene in VR. Check it out <a href="https://www.pixelpusher.ninja/three/blackbird/" target="_blank">here</a>','I had worked with Caleb Stone before, making 3D music videos using cinema4D and the adobe suite. We decided to move from music videos to a medium that would be more interactive similar to a video game. With assistance in 3D modeling from <REPLACE NAME HERE>, I used Three.js to create a world which can be explored while listening to the sounds produced by Caleb Stone and Pyrimid Vritra for their EP entitled, Adelaide. Check it out <a href="https://www.pixelpusher.ninja/three/OceanWorld.html" target="_blank">here</a>'];

    this.clicker = document.getElementById("slider");


    this.container = document.getElementById("slider");
    this.images = JSON.parse(this.container.getAttribute('data-images'));
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    this.camera.position.set(0, 0, 2);
    this.time = 0;
    this.current = -1;
    this.textures = [];
    this.pointer = { 
      x: window.innerWidth  / 2, 
      y: window.innerHeight / 2 
    };

    this.paused = true;
    this.initiate(()=>{
      console.log(this.textures);
      this.setupResize();
      this.settings();
      this.addObjects();
      this.resize();
      this.clickEvent();
      this.play();
    })
    


  }

  initiate(cb){
    const promises = [];
    let that = this;
    this.images.forEach((url,i)=>{
      let promise = new Promise(resolve => {
        that.textures[i] = new THREE.TextureLoader().load( url, resolve );
      });
      promises.push(promise);
    })

    var mouseListener = function(event) {
      this.pointer.x = event.clientX;
      this.pointer.y = event.clientY;
      this.rotateTxt(this.pointer.x, this.pointer.y);
    }.bind(this);
    
    window.addEventListener("mousemove", mouseListener);

    document.onclick = () => {
      // feature detect
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
              if (permissionState === 'granted') {
              document.onclick = null;
              window.removeEventListener('mousemove', mouseListener);
              window.addEventListener('deviceorientation', (event) => {
                TweenLite.to("#landing", 0, {
                  rotationX: event.gamma/90*30,
                  rotationY: event.gamma/90*40,
                  rotation: event.gamma/90*16,
                  duration: 0.8,
                  ease: 'sine'
                });
              });
              }
          })
          .catch(console.error);
      } else {
          // handle regular non iOS 13+ devices
          document.onclick = () => {};
      }
    }

    Promise.all(promises).then(() => {
      if (cb) cb();
    });
  }

  clickEvent(){
    // this.clicker.addEventListener('click',()=>{
    //   this.next();
    // })
  }
  settings() {
    let that = this;
    if(this.debug) this.gui = new dat.GUI();
    this.settings = {progress:0.5};
    // if(this.debug) this.gui.add(this.settings, "progress", 0, 1, 0.01);

    Object.keys(this.uniforms).forEach((item)=> {
      this.settings[item] = this.uniforms[item].value;
      if(this.debug) this.gui.add(this.settings, item, this.uniforms[item].min, this.uniforms[item].max, 0.01);
    })
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    

    // image cover
    this.imageAspect = this.textures[0].image.height/this.textures[0].image.width;
    let a1; let a2;
    if(this.height/this.width>this.imageAspect) {
      a1 = (this.width/this.height) * this.imageAspect ;
      a2 = 1;
    } else{
      a1 = 1;
      a2 = (this.height/this.width) / this.imageAspect;
    }

    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;
    this.material.uniforms.resolution.value.z = a1;
    this.material.uniforms.resolution.value.w = a2;

    const dist  = this.camera.position.z;
    const height = 1;
    this.camera.fov = 2*(180/Math.PI)*Math.atan(height/(2*dist));

    this.plane.scale.x = this.camera.aspect;
    this.plane.scale.y = 1;

    this.camera.updateProjectionMatrix();
  }

  calcOffset(xPos, yPos) {
    let winW = window.innerWidth;
    let winH = window.innerHeight/1.3;
    let dX = 2*(xPos - winW/2)/winW;
    let dY = -2*(yPos - winH/2)/winH + 1;
    return [dX,dY];
  }

  rotateTxt(xPos, yPos) {
    let nPos = this.calcOffset(xPos, yPos); // get cursor position from center 1-0-1
    let nX = nPos[0];
    let nY = nPos[1];
    TweenLite.to("#landing", 0, {
      rotationX: nY*30,
      rotationY: nX*50,
      rotation: nX*40,
      duration: 0.8,
      ease: 'sine'
    });
  }

  addObjects() {
    let that = this;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        progress: { type: "f", value: 0 },
        border: { type: "f", value: 0 },
        intensity: { type: "f", value: 22 },
        scaleX: { type: "f", value: 40 },
        scaleY: { type: "f", value: 40 },
        transition: { type: "f", value: 40 },
        swipe: { type: "f", value: 0 },
        width: { type: "f", value: 0 },
        radius: { type: "f", value: 0 },
        texture1: { type: "f", value: this.textures[0] },
        texture2: { type: "f", value: this.textures[1] },
        displacement: { type: "f", value: new THREE.TextureLoader().load('img/disp1.jpg') },
        resolution: { type: "v4", value: new THREE.Vector4() },
      },
      // wireframe: true,
      vertexShader: this.vertex,
      fragmentShader: this.fragment
    });

    this.geometry = new THREE.PlaneGeometry(1, 1, 2, 2);

    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);
  }

  stop() {
    this.paused = true;
  }

  play() {
    this.paused = false;
    this.render();
  }

  next(){
    var desc = document.getElementById('description');
    desc.style.opacity = 0;
    if(this.isRunning) return;
    this.isRunning = true;
    let len = this.textures.length;
    let nextTexture =this.textures[(this.current +1)%len];
    this.material.uniforms.texture2.value = nextTexture;
    let tl = new TimelineMax();
    tl.to(this.material.uniforms.progress,this.duration,{
      value:1,
      ease: Power2[this.easing],
      onComplete:()=>{
        console.log('FINISH');
        this.current = (this.current +1)%len;
        this.material.uniforms.texture1.value = nextTexture;
        this.material.uniforms.progress.value = 0;
        this.isRunning = false;
        var desc = document.getElementById('description');
        desc.innerHTML = this.descriptions[(this.current +1)%len];
        desc.style.opacity = 1;
    }})
  }
  previous(){
    var desc = document.getElementById('description');
    desc.style.opacity = 0;
    if(this.isRunning) return;
    this.isRunning = true;
    let len = this.textures.length;
    if (this.current - 1 < 0) this.current = len;
    let nextTexture =this.textures[(this.current -1)%len];
    this.material.uniforms.texture2.value = nextTexture;
    let tl = new TimelineMax();
    tl.to(this.material.uniforms.progress,this.duration,{
      value:1,
      ease: Power2[this.easing],
      onComplete:()=>{
        console.log('FINISH');
        this.current = (this.current - 1)%len;
        if (this.current < 0) this.current = len - 1;
        this.material.uniforms.texture1.value = nextTexture;
        this.material.uniforms.progress.value = 0;
        this.isRunning = false;
        var desc = document.getElementById('description');
        desc.innerHTML = this.descriptions[(this.current-1)%len];
        desc.style.opacity = 1;
    }})
  }
  set(index){
    var desc = document.getElementById('description');
    desc.style.opacity = 0;
    if(this.isRunning) return;
    this.isRunning = true;
    this.current = index;
    let len = this.textures.length;
    let nextTexture =this.textures[(this.current)];
    this.material.uniforms.texture2.value = nextTexture;
    let tl = new TimelineMax();
    tl.to(this.material.uniforms.progress,this.duration,{
      value:1,
      ease: Power2[this.easing],
      onComplete:()=>{
        // console.log('FINISH');
        this.material.uniforms.texture1.value = nextTexture;
        this.material.uniforms.progress.value = 0;
        this.isRunning = false;
        var desc = document.getElementById('description');
        desc.innerHTML = this.descriptions[(this.current)%len];
        desc.style.opacity = 1;
    }})
  }
  render() {
    if (this.paused) return;
    this.time += 0.05;
    this.material.uniforms.time.value = this.time;
    // this.material.uniforms.progress.value = this.settings.progress;

    Object.keys(this.uniforms).forEach((item)=> {
      this.material.uniforms[item].value = this.settings[item];
    });

    // this.camera.position.z = 3;
    // this.plane.rotation.y = 0.4*Math.sin(this.time)
    // this.plane.rotation.x = 0.5*Math.sin(0.4*this.time)

    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}