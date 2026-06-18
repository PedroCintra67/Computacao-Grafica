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

uniform float uKimonoPart;
uniform float uSqueezePantsTop;

void main() {
    vec3 pos = aPosition;
    
    // Se for a calça (4.0 ou 5.0) e tivermos que afinar o topo
    if ((abs(uKimonoPart - 4.0) < 0.1 || abs(uKimonoPart - 5.0) < 0.1) && uSqueezePantsTop > 0.0) {
        // Afinar progressivamente da altura Y=0 (barra da saia) até Y=68 (cintura)
        float squeezeAmount = smoothstep(0.0, 68.0, pos.y);
        float currentScale = mix(1.0, uSqueezePantsTop, squeezeAmount);
        pos.x *= currentScale;
        pos.z *= currentScale;
    }

    // Transform vertex to view space
    vec4 viewModelPos = uModelViewMatrix * vec4(pos, 1.0);
    
    // Final position on screen
    gl_Position = uProjectionMatrix * viewModelPos;
    
    // Pass attributes
    vTexCoord = aTexCoord;
    vNormal = uNormalMatrix * aNormal;
    vViewPosition = viewModelPos.xyz;
    vModelPosition = pos;
}
