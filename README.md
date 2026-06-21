# Loja 3D de Kimonos

**Acesse o projeto online:** [https://pedrocintra67.github.io/Computacao-Grafica/](https://pedrocintra67.github.io/Computacao-Grafica/)

**Disciplina:** EEL882 - Computação Gráfica  
**Aluno:** Pedro Cintra Silveira
**DRE:** 123419342

## 🥋 Sobre o Projeto
Uma aplicação interativa de e-commerce 3D dedicada a kimonos de Jiu-Jitsu. O projeto simula um ambiente virtual onde o usuário pode visualizar modelos em uma vitrine realista, inspecioná-los em 360 graus e personalizar cada parte do traje. Tudo é renderizado em tempo real diretamente no navegador utilizando p5.js e WebGL.

Decidi focar nos conceitos apresentados nas aulas de computação gráfica que mais me interessei:
* **Modelagem Procedural:** Geração matemática da malha 3D em tempo real (costuras, dobras e mangas) através de funções senoidais, curvas de Bezier e interpolação.
* **Pipelines de Renderização (Shaders GLSL):** Criação de um Fragment Shader otimizado do zero para lidar com diferentes materiais numa única passagem (*Uber Shader*).
* **Modelos de Iluminação (Blinn-Phong):** Implementação nativa do algoritmo de **Blinn-Phong** para tratar reflexos especulares reluzentes (materiais polidos) e cálculo de **Fresnel** para simular a iluminação em bordas de tecidos.
* **Texturização Mapeada (UV Mapping):** Projeção procedural de decalques (logos) e estampas de patrocínio no tecido, fundindo a imagem perfeitamente com a malha 3D.
* **Transformações Geométricas:** Uso das matrizes de Transformação (Translação, Rotação e Escala) para controle de Câmera Orbital interativa e posicionamento hierárquico das partes do corpo.

## 🛒 Como Usar a Loja
A página inicia no "Modo Vitrine" com um passeio panorâmico automático por três pedestais exibindo os modelos clássicos (Atama, Vouk e Kingz).

Para explorar o e-commerce:
1. Clique no botão **"Entrar na Loja"** localizado embaixo do modelo desejado na vitrine.
2. Utilize o painel lateral para misturar cores das peças (top, calça e faixa) e visualizar em tempo real os diferentes tipos de tecido.
3. Habilite o painel de *Patch* e digite seu nome para gerar um bordado customizado dinâmico nas costas do kimono!
4. Use o slider de **Idade do Kimono** para simular desgaste e sujeira orgânica na textura do tecido.

### Controles Principais
* **Clique e Arraste (Mouse):** Gira a câmera livremente em 360 graus em torno do modelo para visualizar os detalhes das costas e mangas.
* **Scroll do Mouse:** Controla o Zoom (aproxima e afasta) para inspecionar de perto as costuras ou a iluminação dos materiais.
