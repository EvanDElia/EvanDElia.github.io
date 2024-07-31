uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;
varying vec2 vUv;

void main()
{
    float length = length(vUv - 0.5);
    float elevation = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 newCol = uDepthColor;
    newCol.r += elevation - length;
    newCol.b -= vUv.y - length;
    vec3 color = mix(uSurfaceColor, newCol, elevation);

    color *= .8 - length;

    gl_FragColor = vec4(color, 1.0);
}