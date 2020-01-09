require('./styles.less');

if (window.innerHeight > window.innerWidth) {
    document.getElementsByTagName('main')[0].classList.add('mobile');
}

let Sketch = require('./sketch.js');
let index = 0;
let waiting = false;
let current = -1;

let sketch = new Sketch({
	duration: 2,
	debug: false,
	easing: 'easeOut',
	uniforms: {
		// width: {value: 0.35, type:'f', min:0., max:1},
	},
	fragment: `
		uniform float time;
		uniform float progress;
		uniform float width;
		uniform float scaleX;
		uniform float scaleY;
		uniform float transition;
		uniform float radius;
		uniform float swipe;
		uniform sampler2D texture1;
		uniform sampler2D texture2;
		uniform sampler2D displacement;
		uniform vec4 resolution;

		varying vec2 vUv;
		varying vec4 vPosition;
		vec2 mirrored(vec2 v) {
			vec2 m = mod(v,2.);
			return mix(m,2.0 - m, step(1.0 ,m));
		}

		void main()	{
		  vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
		  vec4 noise = texture2D(displacement, mirrored(newUV+time*0.04));
		  // float prog = 0.6*progress + 0.2 + noise.g * 0.06;
          float prog = progress*0.8 -0.05 + noise.g * 0.16;
          float extraDisplacement = noise.g * 0.004;
		  float intpl = pow(abs(smoothstep(0., 1., (prog*2. - vUv.x + 0.5))), 20.);
		  
		  vec4 t1 = texture2D( texture1, (newUV - 0.5 + extraDisplacement) * (1.0 - intpl) + 0.5 ) ;
		  vec4 t2 = texture2D( texture2, (newUV - 0.5 + extraDisplacement) * intpl + 0.5 );
		  gl_FragColor = mix( t1, t2, intpl );

		}

	`
});
// sketch.initiate();
checkState();

document.getElementById('slider-arrow-right').onclick = function(evt) {
    if (!sketch.isRunning && !waiting) {
        waiting = true;
        index++;
        // sketch.next();
        checkState();
    }
}

document.getElementById('slider-arrow-left').onclick = function(evt) {
    if (!sketch.isRunning && !waiting) {
        waiting = true;
        index--;
        // sketch.previous();
        checkState();
    }
}

document.onkeydown = function(evt){
    if (!sketch.isRunning && !waiting) {
        waiting = true;

        if (evt.keyCode == 37){
            index--;
            // sketch.next();
            checkState();
        }
        else if (evt.keyCode == 39){
            index++;
            // sketch.previous();
            checkState();
        }
    }
}

document.querySelectorAll('.project')[0].onclick = function(){if (!sketch.isRunning && !waiting) { index = 1; checkState()}};
document.querySelectorAll('.project')[1].onclick = function(){if (!sketch.isRunning && !waiting) { index = 2; checkState()}};
document.querySelectorAll('.project')[2].onclick = function(){if (!sketch.isRunning && !waiting) { index = 3; checkState()}};
document.querySelectorAll('.project')[3].onclick = function(){if (!sketch.isRunning && !waiting) { index = 4; checkState()}};

function checkState() {
    if (index > 4) index = 0;
    else if (index < 0) index = 4;

    if (index == 0) {
        setTimeout(function() { document.getElementById('landing').style.height = '100%'; document.getElementById('landing').style.opacity = 1; document.getElementById('landing').style.perspective = '400px'; waiting = false;}, 900);
        document.getElementById('slider').style.opacity = 0;
        document.getElementById('slider-arrow-left').style.opacity = 0;
        document.getElementById('slider-arrow-left').style.pointerEvents = 'none';
        document.getElementById('description').style.opacity = 0;
        document.getElementById('slider-arrow-right').style.mixBlendMode = 'unset';
        if (current >= 0 ) document.querySelector('.current').classList.remove('current');
        if (document.getElementsByTagName('main')[0].classList.contains('mobile')) {document.getElementsByTagName('body')[0].style.overflowY = 'hidden'};
        current = -1;
    }
    else { //needs better solution
        document.getElementById('landing').style.perspective = '1px';
        setTimeout(function() { document.getElementById('landing').style.height = '0%'; document.getElementById('slider').style.opacity = 1; waiting = false; }, 1100);
        document.getElementById('landing').style.opacity = 0;
        document.getElementById('slider-arrow-left').style.opacity = 1;
        document.getElementById('slider-arrow-left').style.pointerEvents = 'all';
        if (current >= 0 ) document.querySelector('.current').classList.remove('current');
        if (document.getElementsByTagName('main')[0].classList.contains('mobile')) {document.getElementsByTagName('body')[0].style.overflowY = 'auto'};
        document.querySelectorAll('.project')[index-1].classList.add('current');
        current = index;
        sketch.set(index - 1);
    }
}