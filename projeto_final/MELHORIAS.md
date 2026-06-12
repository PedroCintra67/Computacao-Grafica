# Melhorias Possíveis para o Projeto — Kimono BJJ 3D

> Lista organizada por prioridade e dificuldade de implementação.

---

## 🟢 Fáceis (até 1 hora cada)

### 1. Segundo Manequim ao Lado
Adicionar um segundo manequim estático com cor de faixa diferente, criando uma cena de dojô mais completa. Requer apenas duplicar a chamada `drawKimonoTorso()` com um `push()/translate()/pop()` diferente.

### 2. Botão de Câmera Fixa (Frente / Lateral / Cima)
Adicionar 3 botões na UI que reposicionam a câmera instantaneamente para vistas canônicas. Atualmente a câmera volta suavemente ao centro, mas não há botões de preset.

### 3. Animação Idle (Oscilação suave)
Usar `sin(frameCount * 0.01)` para dar uma oscilação muito suave ao manequim, como se estivesse respirando. Uma transformação de `rotateY` com amplitude mínima já daria vida à cena.

### 4. Worley Noise no Tecido do Kimono
No `frag.glsl`, substituir o ruído simples atual por um **Worley Noise** para simular a trama do pérola (pearl weave) com variação orgânica de cor entre os fios.

### 5. Sombra Simplificada no Chão (Shadow Map Fake)
Desenhar uma elipse escura e semi-transparente embaixo do pedestal no tatame para simular sombra. Não requer ray casting, apenas um `plane` com material escuro e translúcido.

---

## 🟡 Médias (1 dia cada)

### 6. Visualizador de Posições de Golpes (Mais impactante!)
Adicionar um segundo manequim e exibir **poses estáticas de técnicas de BJJ** com botões na UI:
- Guard Fechado
- Mount (Posição de domínio)
- Armbar
- Rear Naked Choke
- Triangle Choke

Requer definir um sistema de `transforms[]` por parte do corpo para cada pose. As poses são estáticas (sem animação), o que simplifica muito.

### 7. Animação "Belt Ceremony" ao Graduar
Quando o slider de tempo sobe de nível de faixa, disparar:
1. Faixa atual desce (lerp para baixo por 30 frames)
2. Flash dourado no shader (`uFlashIntensity` uniform)
3. Nova faixa desce do topo (lerp)

Usa `frameCount` e uma máquina de estados simples (`animState`).

### 8. Dithering de Bayer no Shader
No modo de iluminação padrão, aplicar a **matriz de Bayer 4×4** para quantizar a sombra em padrões de pontilhado, criando efeito retro/artístico nas partes em sombra do kimono.

```glsl
// Exemplo no frag.glsl — aplicar ao valor de diffuse antes da composição final
float bayerThreshold = bayerMatrix[int(gl_FragCoord.y)%4 * 4 + int(gl_FragCoord.x)%4];
float ditheredDiff = step(bayerThreshold, diff);
```

### 9. Normal Mapping Procedural nos Graus da Faixa
Usar perturbação da normal no shader para simular que as listras (graus) têm borda levantada/costurada sem adicionar geometria. Aumenta o realismo da faixa.

### 10. Painel de Informações sobre cada Faixa
Ao clicar em um botão de faixa na UI, mostrar um painel lateral com texto informativo sobre a faixa:
- Tempo médio de graduação
- Requisitos técnicos (número de faixas, atletas famosos)
- Curiosidades do BJJ

Apenas HTML/CSS, sem código 3D.

---

## 🔴 Avançadas (vários dias)

### 11. Superfície de Bézier para o Corpo do Kimono
Substituir as geometrias de cilindros por **retalhos de Bézier bicúbicos** (grade 4×4 de pontos de controle) gerados via `beginShape(TRIANGLES)/vertex()`. O torso ficaria com curvas orgânicas reais em vez da elipse extrudida atual.

### 12. Sweep para o Colarinho
Modelar o colarinho usando a técnica de **varredura (sweep)**: um perfil trapezoidal varrido ao longo da curva do pescoço do manequim. Resultado: colarinho com curvatura natural e espessura variável, como um kimono real.

### 13. Marching Cubes para Manequim Orgânico
Gerar o manequim inteiro a partir de **SDFs (Signed Distance Functions)** combinadas com `smin()` (união suave) e trianguladas via Marching Cubes. O resultado seria um manequim anatomicamente correto com transições orgânicas entre membros.

### 14. Quiz Interativo "Que Faixa é Essa?"
Mini-jogo na sidebar: o sistema mostra uma faixa aleatória sem revelar o nome, e o usuário deve clicar na opção correta entre 4 escolhas. Acerto → efeito dourado no shader. Erro → flash vermelho.

### 15. Câmera Walk-Through do Dojô
Teclas WASD movem a câmera pelo ambiente do dojô livremente (tatame + paredes + quadros). Demonstra implementação de câmera em first-person com look-at dinâmico.

---

## 📊 Resumo por Prioridade

| # | Melhoria | Dificuldade | Impacto Visual | Cobre Conceito da Aula |
|---|---|---|---|---|
| 6 | Visualizador de Golpes | 🟡 Médio | ⭐⭐⭐⭐⭐ | Transformações 3D |
| 7 | Belt Ceremony animado | 🟡 Médio | ⭐⭐⭐⭐⭐ | Animação/Lerp |
| 3 | Animação idle | 🟢 Fácil | ⭐⭐⭐ | Transformações |
| 4 | Worley Noise tecido | 🟢 Fácil | ⭐⭐⭐⭐ | Texturas Procedurais |
| 8 | Dithering de Bayer | 🟡 Médio | ⭐⭐⭐ | Proc. de Imagem |
| 11 | Superfície de Bézier | 🔴 Difícil | ⭐⭐⭐⭐⭐ | Superfícies |
| 12 | Sweep no colarinho | 🔴 Difícil | ⭐⭐⭐⭐⭐ | Malhas |
| 13 | Marching Cubes | 🔴 Difícil | ⭐⭐⭐⭐⭐ | Malhas |
