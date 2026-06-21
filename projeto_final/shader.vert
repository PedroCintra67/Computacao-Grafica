#version 300 es
precision highp float;

// Atributos padrão fornecidos pelo p5.js
in vec3 aPosition;
in vec3 aNormal;
in vec2 aTexCoord;

// Matrizes de transformação fornecidas pelo p5.js
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

// Saídas para o fragment shader
out vec2 vTexCoord;
out vec3 vNormal;
out vec3 vViewPosition;
out vec3 vModelPosition;

uniform float uKimonoPart;
uniform float uSqueezePantsTop;

void main() {
    vec3 pos = aPosition;

    // Compressão da cintura da calça (evita atravessar o tecido da blusa)
    if (uKimonoPart >= 3.9 && uKimonoPart <= 5.1 && uSqueezePantsTop > 0.0) {
        float escala = mix(1.0, uSqueezePantsTop, smoothstep(0.0, 68.0, pos.y));
        pos.xz *= escala;
    }

    // Transformar vértice para o espaço de visão
    vec4 pos_view = uModelViewMatrix * vec4(pos, 1.0);

    // Posição final na tela
    gl_Position = uProjectionMatrix * pos_view;

    // Passar atributos para o fragment shader
    vTexCoord    = aTexCoord;
    vNormal      = uNormalMatrix * aNormal;
    vViewPosition  = pos_view.xyz;
    vModelPosition = pos;
}
