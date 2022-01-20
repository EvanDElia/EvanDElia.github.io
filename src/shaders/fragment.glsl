uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;
varying vec2 vUv;

void main()
{
    float elevation = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 newCol = uDepthColor;
    newCol.r += elevation - length(vUv - 0.5);
    newCol.b -= vUv.y - length(vUv - 0.5);
    vec3 color = mix(uSurfaceColor, newCol, elevation);

    color *= .8 - length(vUv - 0.5);

    gl_FragColor = vec4(color, 1.0);
}