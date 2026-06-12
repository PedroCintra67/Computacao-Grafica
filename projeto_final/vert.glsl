#version 300 es
precision highp float;

// Standard attributes provided by p5.js
in vec3 aPosition;
in vec3 aNormal;
in vec2 aTexCoord;

// Transformation matrices from p5.js
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

// Outputs to the fragment shader
out vec2 vTexCoord;
out vec3 vNormal;
out vec3 vViewPosition;
out vec3 vModelPosition;

void main() {
    // Transform vertex to view space
    vec4 viewModelPos = uModelViewMatrix * vec4(aPosition, 1.0);
    
    // Final position on screen
    gl_Position = uProjectionMatrix * viewModelPos;
    
    // Pass attributes
    vTexCoord = aTexCoord;
    vNormal = uNormalMatrix * aNormal;
    vViewPosition = viewModelPos.xyz;
    vModelPosition = aPosition;
}
