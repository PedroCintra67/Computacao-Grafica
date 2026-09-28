# 🥋 Delariva BJJ — Loja & Customizador 3D de Kimonos

[![Demonstração Online](https://img.shields.io/badge/LINK-Acessar%20Projeto%20Online-gold?style=for-the-badge&logo=githubpages)](https://pedrocintra67.github.io/Computacao-Grafica/)
[![WebGL](https://img.shields.io/badge/WebGL-2.0-blue?style=for-the-badge&logo=webgl)](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
[![p5.js](https://img.shields.io/badge/p5.js-1.4.0-ED225D?style=for-the-badge&logo=p5.js)](https://p5js.org/)
[![GLSL](https://img.shields.io/badge/GLSL-300_es-555555?style=for-the-badge&logo=opengl)](https://www.khronos.org/opengl/)

---

## 📌 Sumário
- [Sobre o Projeto](#-sobre-o-projeto)
- [Conceitos de Computação Gráfica Aplicados](#-conceitos-de-computação-gráfica-aplicados)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Como Rodar o Projeto](#-como-rodar-o-projeto)
- [Como Usar a Aplicação](#-como-usar-a-aplicação)
- [Informações Acadêmicas](#-informações-acadêmicas)

---

## 🥋 Sobre o Projeto

O **Delariva BJJ** é uma aplicação interativa 3D desenvolvida para a disciplina de **Computação Gráfica (EEL882 - UFRJ)**. O projeto simula uma loja conceitual e customizador tridimensional de kimonos de Jiu-Jitsu.

A aplicação combina um ambiente de **Vitrine 3D em 360°** com um **Customizador em Tempo Real**, permitindo que o usuário altere materiais, cores, marcas (Vouk, Atama, Kingz), faixas de graduação, tamanhos (A0 a A4), bordados personalizados (nome e equipe) e até a simulação do tempo de uso (envelhecimento/desgaste do tecido).

---

## 📐 Conceitos de Computação Gráfica Aplicados

Este projeto foi construído sem dependência de motores 3D de alto nível (como Three.js ou Babylon.js), utilizando **p5.js em modo WebGL** e **Shaders GLSL customizados** para implementar diretamente os fundamentos da disciplina:

### 1. Modelagem Procedural de Malhas 3D
- As superfícies tridimensionais do kimono (mangas, lapelas, dobras do tecido, vagui e calça) e dos elementos do ambiente (pedestais, quadros, paredes) são geradas **matematicamente via código em tempo real**, sem carregamento de modelos OBJ/FBX externos.
- Cálculo de malhas parametrizadas, curvas de atenuação e deformação procedural (ex: compressão da calça sob o vagui através da uniform `uSqueezePantsTop`).

### 2. Shaders GLSL Customizados (OpenGL ES 3.0)
- Pipeline programável utilizando `shader.vert` (Vertex Shader) e `shader.frag` (Fragment Shader).
- Processamento de iluminação, texturização, mistura de decalques e mapas de ruído em uma **única passagem otimizada**.

### 3. Modelo de Iluminação Blinn-Phong
- Implementação matemática do modelo de reflexão especular de **Blinn-Phong** utilizando o vetor Halfway ($\vec{H} = \frac{\vec{L} + \vec{V}}{\|\vec{L} + \vec{V}\|}$):
  $$I = I_a k_a + I_d k_d (\vec{N} \cdot \vec{L}) + I_s k_s (\vec{N} \cdot \vec{H})^n$$
- Permite diferenciar a resposta de iluminação entre o tecido fosco tipo *Pearl Weave* ($k_s \approx 0.08$, $n \approx 6.0$) e o pedestal de plástico/mármore escuro reluzente ($k_s \approx 1.3$, $n \approx 64.0$).

### 4. Mapeamento de Texturas & Decalques procedurais (UV Mapping)
- Mapeamento coordenado de coordenadas $(U, V)$ para inserção precisa de logos nos peitos e ombros (marcas Atama, Vouk e Kingz) e patches laterais nas calças.
- Geração procedural de relevo de tecido (*Pearl Weave*) no fragment shader usando funções de ruído (*pseudo-random noise*).

### 5. Bordado Dinâmico (Offscreen Canvas Texturing)
- O nome e a equipe digitados pelo usuário são renderizados em um buffer de desenho 2D dinâmico em segundo plano (`createGraphics`) e transferidos instantaneamente como textura para a malha 3D das costas do kimono.

### 6. Simulação de Desgaste e Envelhecimento
- Função de sombreamento orientada pela uniform `uWearLevel`, que aplica degradação de cor, perda de saturação e manchas orgânicas de desgaste no tecido conforme o slider de tempo de uso é ajustado.

### 7. Câmera Orbital Interativa 360°
- Implementação de câmera baseada em matrizes de visão e projeção perspective.
- Movimentação suave de órbita em volta do objeto alvo com física de interpolação linear (*lerp*) e controle dinâmico de distância focal (zoom).

---

## 🛠️ Funcionalidades Principais

| Funcionalidade | Descrição |
| :--- | :--- |
| 🏬 **Modo Vitrine (Showroom)** | Apresentação em 360° de três modelos clássicos dispostos sobre pedestais de mármore com reflexos de vidro e iluminação de destaque. |
| 🥋 **Customizador de Vagui** | Escolha de cores (Branco, Azul, Preto, Marinho), marca do kimono (Vouk, Atama, Kingz) e tamanhos (A0 a A4). |
| 👖 **Customizador de Calça** | Seleção de cores e tamanhos com encaixe proporcional e simulação de aperto do tecido sob a blusa. |
| 🎗️ **Graduação de Faixas** | Suporte às faixas de Branca a Preta, além de modelos especiais **Coral** e **Coral-Branca** com segmentos procedurais e ponteira preta/vermelha. |
| ✍️ **Bordados Personalizados** | Adição dinâmica de Nome e Equipe nas costas do kimono com ajuste de cor e fonte responsivos ao tom do kimono. |
| ⏳ **Simulação de Desgaste** | Slider que simula a passagem do tempo e uso no tatame (sujeira, desbotamento e envelhecimento natural do tecido). |
| 🛒 **Carrinho e Desconto Combo** | Cálculo automático do valor total, desconto progressivo ao montar o conjunto completo e modal final de confirmação do pedido. |

---

## 📂 Estrutura do Repositório

```bash
Computação Gráfica/
├── projeto_final/
│   ├── index.html           # Interface da aplicação (HTML5 semântico e overlay UI)
│   ├── style.css            # Estilização com Glassmorphism, fontes e temas dark
│   ├── main.js              # Loop de renderização principal p5.js e gerenciamento de estado
│   ├── kimono.js            # Geração procedural da malha 3D do Kimono (Vagui e Calça)
│   ├── faixa.js             # Modelagem da Faixa e Nó tridimensional
│   ├── ambiente.js          # Construção da cena (Vitrine, Pedestais, Quadros, Parede, Vidro)
│   ├── texturas.js          # Criação e carregamento das texturas e decalques das marcas
│   ├── camera_eventos.js    # Controle da Câmera Orbital 360°, Mouse Drag e Scroll Zoom
│   ├── ui.js                # Interatividade dos botões, navegação de etapas e preços
│   ├── shader.vert          # Vertex Shader GLSL (Transformações e cálculo de normais)
│   ├── shader.frag          # Fragment Shader GLSL (Blinn-Phong, Wear, Decals, Pearl Weave)
│   ├── p5.min.js            # Biblioteca p5.js minificada
│   ├── carlos.jpg           # Imagem histórica decorativa (Carlos Gracie)
│   └── helio.jpg            # Imagem histórica decorativa (Hélio Gracie)
├── .gitignore               # Regras de exclusão do Git
└── README.md                # Documentação oficial do projeto
```

---

## 🚀 Como Rodar o Projeto

Como o projeto faz uso de **WebGL com Shaders GLSL e carregamento de imagens em tempo real**, o navegador exige que a página seja servida através de um protocolo HTTP/HTTPS seguro (evitando bloqueios de CORS por uso de `file://`).

### Opção 1: Acesso Direto (Sem Instalação)
Você pode testar a aplicação imediatamente através do GitHub Pages:
🔗 **[https://pedrocintra67.github.io/Computacao-Grafica/](https://pedrocintra67.github.io/Computacao-Grafica/)**

---

### Opção 2: Servidor Local em Python (Recomendado)

Se você tem o Python instalado em seu computador:

1. Abra o terminal na pasta do projeto:
   ```bash
   cd "projeto_final"
   ```
2. Execute o servidor HTTP embutido do Python:
   ```bash
   python -m http.server 8000
   ```
3. Abra seu navegador de preferência e acesse:
   ```text
   http://localhost:8000
   ```

---

### Opção 3: VS Code (Extensão Live Server)

1. Abra a pasta `projeto_final` no [Visual Studio Code](https://code.visualstudio.com/).
2. Instale a extensão **Live Server** (caso ainda não tenha).
3. Clique com o botão direito no arquivo `index.html` e selecione **"Open with Live Server"**.

---

### Opção 4: Node.js / npx (http-server ou serve)

Caso prefira utilizar o ambiente Node.js:

```bash
cd "projeto_final"
npx serve .
```
ou:
```bash
npx http-server . -p 8000
```
Em seguida, acesse `http://localhost:8000` no seu navegador.

---

## 🕹️ Como Usar a Aplicação

1. **Explorando a Vitrine**:
   - A página inicia no **Modo Vitrine**, apresentando um passeio panorâmico automático.
   - Clique e arraste o mouse para girar a câmera em 360° em volta da vitrine.
   - Use o scroll do mouse para aproximar ou afastar o zoom.

2. **Personalizando seu Kimono**:
   - Clique no botão **"Selecionar Produtos"** localizado abaixo do pedestal desejado.
   - Alterne pelas abas **Vagui (Blusa)**, **Calça**, **Faixa** e **Carrinho**.
   - Escolha cores, marcas, tamanhos e digite seu Nome/Equipe para ver o bordado ser aplicado nas costas do kimono em tempo real.
   - Ajuste o slider de **Tempo de Uso** para conferir a simulação de envelhecimento do tecido.

3. **Finalizando a Compra**:
   - Adicione os itens desejados ao carrinho para obter o **Desconto Combo**.
   - Clique em **"Finalizar Pedido"** para abrir o modal com o resumo completo e a nota do seu pedido customizado.

---

## 🎓 Informações Acadêmicas

- **Instituição:** Universidade Federal do Rio de Janeiro (UFRJ)
- **Curso:** Engenharia de Computação / Ciência da Computação
- **Disciplina:** EEL882 - Computação Gráfica
- **Aluno:** Pedro Cintra Silveira
- **DRE:** 123419342

---

<p align="center">
  <b>Delariva BJJ — A performance começa no conforto. OSS! 🥋</b>
</p>
