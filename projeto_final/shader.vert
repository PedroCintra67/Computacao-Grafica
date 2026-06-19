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

    // Compressão lateral da calça (partes 4.0 e 5.0) quando usada junto com o kimono
    if ((abs(uKimonoPart - 4.0) < 0.1 || abs(uKimonoPart - 5.0) < 0.1) && uSqueezePantsTop > 0.0) {
        // Afinar progressivamente da barra (Y=0) até a cintura (Y=68)
        float fator_compressao = smoothstep(0.0, 68.0, pos.y);
        float escala_atual     = mix(1.0, uSqueezePantsTop, fator_compressao);
        pos.x *= escala_atual;
        pos.z *= escala_atual;
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
