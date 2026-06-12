# run.py — Motor de compatibilidade p5.js → py5
import sys
import os
import re
import subprocess
import ctypes

def get_screen_size():
    """Obtém a resolução real da tela no Windows."""
    try:
        user32 = ctypes.windll.user32
        return user32.GetSystemMetrics(0), user32.GetSystemMetrics(1)
    except:
        return 1280, 720

# Protótipos para satisfazer o IntelliSense do VS Code
def createCanvas(w, h): pass
def background(*args): pass
def fill(*args): pass
def noFill(): pass
def stroke(*args): pass
def noStroke(): pass
def strokeWeight(w): pass
def circle(x, y, r): pass
def rect(x, y, w, h): pass
def square(x, y, s): pass
def triangle(x1, y1, x2, y2, x3, y3): pass
def ellipse(x, y, w, h): pass
def line(x1, y1, x2, y2): pass
def point(x, y): pass
def quad(x1, y1, x2, y2, x3, y3, x4, y4): pass
def arc(x, y, w, h, start, stop, mode=None): pass
def translate(x, y): pass
def rotate(a): pass
def scale(s): pass
def push(): pass
def pop(): pass
def pushMatrix(): pass
def popMatrix(): pass
def textSize(s): pass
def textAlign(h, v=None): pass
def frameRate(f): pass
def rectMode(m): pass
def ellipseMode(m): pass
def cos(a): pass
def sin(a): pass
def tan(a): pass
def atan2(y, x): pass
def sqrt(n): pass
def pow(n, e): pass
def abs(n): pass
def min(*a): pass
def max(*a): pass
def round(n): pass
def floor(n): pass
def ceil(n): pass
def random(a, b=None): pass
def noise(x, y=0, z=0): pass

# Variáveis globais para o VS Code
windowWidth, windowHeight = get_screen_size()
width, height = 100, 100
mouseX, mouseY = 0, 0
PI = 3.14159265
HALF_PI = 1.57079632
TWO_PI = 6.28318530
TAU = 6.28318530
PIE = 2
CENTER = 3
RADIUS = 2
CORNER = 0
CORNERS = 1

# Mapeamento de tokens p5.js para chamadas explícitas py5
TOKEN_MAP = {
    'width': 'py5.width',
    'height': 'py5.height',
    'mouseX': 'py5.mouse_x',
    'mouseY': 'py5.mouse_y',
    'frameCount': 'py5.frame_count',
    'windowWidth': str(windowWidth),
    'windowHeight': str(windowHeight),
    'createCanvas': 'py5.size',
    'createGraphics': 'py5.create_graphics',
    'beginDraw': 'begin_draw',
    'endDraw': 'end_draw',
    'size': 'py5.size',
    'background': 'background', 
    'fill': 'fill',             
    'stroke': 'stroke',         
    'noFill': 'py5.no_fill',
    'noStroke': 'py5.no_stroke',
    'strokeWeight': 'py5.stroke_weight',
    'circle': 'py5.circle',
    'rect': 'py5.rect',
    'square': 'py5.square',
    'triangle': 'py5.triangle',
    'ellipse': 'py5.ellipse',
    'line': 'py5.line',
    'point': 'py5.point',
    'quad': 'py5.quad',
    'arc': 'py5.arc',
    'rectMode': 'py5.rect_mode',
    'ellipseMode': 'py5.ellipse_mode',
    'translate': 'py5.translate',
    'rotate': 'py5.rotate',
    'rotateX': 'py5.rotate_x',
    'rotateY': 'py5.rotate_y',
    'rotateZ': 'py5.rotate_z',
    'scale': 'py5.scale',
    'push': 'py5.push',
    'pop': 'py5.pop',
    'pushMatrix': 'py5.push_matrix',
    'popMatrix': 'py5.pop_matrix',
    'resetMatrix': 'py5.reset_matrix',
    'textSize': 'py5.text_size',
    'textAlign': 'py5.text_align',
    'cos': 'py5.cos',
    'sin': 'py5.sin',
    'tan': 'py5.tan',
    'atan2': 'py5.atan2',
    'sqrt': 'py5.sqrt',
    'pow': 'py5.pow',
    'abs': 'py5.abs',
    'round': 'py5.round',
    'floor': 'py5.floor',
    'ceil': 'py5.ceil',
    'noise': 'py5.noise',
    'ambientLight': 'ambientLight',
    'directionalLight': 'directionalLight',
    'box': 'box',
    'sphere': 'sphere',
    'sphereDetail': 'py5.sphere_detail',
    'loadShader': 'loadShader',
    'shader': 'py5.shader',
    'setUniform': 'set',
    'WEBGL': 'py5.P3D',
    'P3D': 'py5.P3D',
    'P2D': 'py5.P2D',
    'PI': 'py5.PI',
    'HALF_PI': 'py5.HALF_PI',
    'TWO_PI': 'py5.TWO_PI',
    'TAU': 'py5.TAU',
    'PIE': 'py5.PIE',
    'CENTER': 'py5.CENTER',
    'RADIUS': 'py5.RADIUS',
    'CORNER': 'py5.CORNER',
    'CORNERS': 'py5.CORNERS',
}

def transform_source(source):
    def replace_tokens(text):
        def rep(match):
            token = match.group(0)
            start_idx = match.start()
            if start_idx > 0 and text[start_idx - 1] == '.':
                replacement = TOKEN_MAP[token]
                if replacement.startswith('py5.'):
                    return replacement[4:]
                return replacement
            return TOKEN_MAP[token]
        pattern = re.compile(r'\b(' + '|'.join(re.escape(k) for k in TOKEN_MAP.keys()) + r')\b')
        return pattern.sub(rep, text)

    lines = source.splitlines()
    settings_body = []
    setup_body = []
    other_code = []
    assigned_vars = set()
    in_setup = False
    setup_finished_init = False
    
    for line in lines:
        if "run.start()" in line or "from run import *" in line:
            continue
            
        if line.strip().startswith("def setup():"):
            in_setup = True
            continue
            
        if in_setup:
            if line.strip() and not (line.startswith(" ") or line.startswith("\t")):
                in_setup = False
            else:
                transformed_line = replace_tokens(line)
                match = re.search(r'^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=', transformed_line)
                if match: assigned_vars.add(match.group(1))

                if not setup_finished_init:
                    settings_body.append(transformed_line)
                    if "py5.size(" in transformed_line: setup_finished_init = True
                
                if "py5.size(" not in transformed_line: setup_body.append(transformed_line)
                continue
        
        other_code.append(replace_tokens(line))

    # Injeção de compatibilidade de cores e constantes
    header = f"""import py5
from py5 import *

# Dicionário de Cores CSS traduzido para inteiros ARGB
_C = {{
    'white': 0xFFFFFFFF, 'black': 0xFF000000, 'red': 0xFFFF0000, 'green': 0xFF00FF00, 
    'blue': 0xFF0000FF, 'yellow': 0xFFFFFF00, 'cyan': 0xFF00FFFF, 'magenta': 0xFFFF00FF,
    'gray': 0xFF808080, 'grey': 0xFF808080, 'silver': 0xFFC0C0C0, 'maroon': 0xFF800000,
    'olive': 0xFF808000, 'purple': 0xFF800080, 'teal': 0xFF008080, 'navy': 0xFF000080,
    'orange': 0xFFFFA500, 'pink': 0xFFFFC0CB, 'gold': 0xFFFFD700, 'brown': 0xFFA52A2A
}}

def _cw(f, *a):
    if len(a) == 1 and isinstance(a[0], str) and a[0].lower() in _C:
        return f(_C[a[0].lower()])
    return f(*a)

def background(*a): return _cw(py5.background, *a)
def fill(*a): return _cw(py5.fill, *a)
def stroke(*a): return _cw(py5.stroke, *a)

def loadShader(vert, frag=None):
    if frag is None: return py5.load_shader(vert)
    return py5.load_shader(frag, vert)

def ambientLight(*a): 
    if len(a) == 1: return py5.ambient_light(a[0], a[0], a[0])
    return py5.ambient_light(*a)

def directionalLight(*a): return py5.directional_light(*a)

def sphere(r, *a):
    if len(a) >= 2: py5.sphere_detail(int(a[0]), int(a[1]))
    elif len(a) == 1: py5.sphere_detail(int(a[0]))
    return py5.sphere(r)

def box(w, h=None, d=None):
    if h is None: return py5.box(float(w))
    if d is None: return py5.box(float(w), float(h), float(h))
    return py5.box(float(w), float(h), float(d))

def cylinder(radius=50, height=50, detailX=24, detailY=1, bottomCap=True, topCap=True):
    py5.push_matrix()
    for j in range(detailY):
        py5.begin_shape(py5.QUAD_STRIP)
        for i in range(detailX + 1):
            angle = py5.TWO_PI * i / detailX
            x = py5.cos(angle) * radius
            z = py5.sin(angle) * radius
            py5.vertex(x, j * height / detailY - height/2, z)
            py5.vertex(x, (j+1) * height / detailY - height/2, z)
        py5.end_shape()
    if topCap:
        py5.begin_shape(py5.TRIANGLE_FAN)
        py5.vertex(0, -height/2, 0)
        for i in range(detailX + 1):
            angle = py5.TWO_PI * i / detailX
            py5.vertex(py5.cos(angle) * radius, -height/2, py5.sin(angle) * radius)
        py5.end_shape()
    if bottomCap:
        py5.begin_shape(py5.TRIANGLE_FAN)
        py5.vertex(0, height/2, 0)
        for i in range(detailX + 1):
            angle = py5.TWO_PI * i / detailX
            py5.vertex(py5.cos(angle) * radius, height/2, py5.sin(angle) * radius)
        py5.end_shape()
    py5.pop_matrix()

def cone(radius=50, height=50, detailX=24, detailY=1, cap=True):
    py5.push_matrix()
    for j in range(detailY):
        r1 = radius * (1 - j/detailY)
        r2 = radius * (1 - (j+1)/detailY)
        py5.begin_shape(py5.QUAD_STRIP)
        for i in range(detailX + 1):
            angle = py5.TWO_PI * i / detailX
            py5.vertex(py5.cos(angle) * r1, j * height / detailY - height/2, py5.sin(angle) * r1)
            py5.vertex(py5.cos(angle) * r2, (j+1) * height / detailY - height/2, py5.sin(angle) * r2)
        py5.end_shape()
    if cap:
        py5.begin_shape(py5.TRIANGLE_FAN)
        py5.vertex(0, -height/2, 0)
        for i in range(detailX + 1):
            angle = py5.TWO_PI * i / detailX
            py5.vertex(py5.cos(angle) * radius, -height/2, py5.sin(angle) * radius)
        py5.end_shape()
    py5.pop_matrix()

def ellipsoid(radiusX=50, radiusY=50, radiusZ=50, detailX=24, detailY=16):
    py5.push_matrix()
    py5.scale(radiusX, radiusY, radiusZ)
    py5.sphere_detail(detailX, detailY)
    py5.sphere(1)
    py5.pop_matrix()

"""
    global_decl = "    global " + ", ".join(assigned_vars) + "\n" if assigned_vars else ""

    new_source = header
    if settings_body:
        new_source += "def settings():\n" + global_decl + "\n".join(settings_body) + "\n\n"
    if setup_body:
        new_source += "def setup():\n" + global_decl + "\n".join(setup_body) + "\n\n"
    elif in_setup:
        new_source += "def setup():\n    pass\n\n"
    
    new_source += "\n".join(other_code)
    new_source += "\nif __name__ == '__main__':\n    py5.run_sketch()\n"
    return new_source

def start():
    main_file = sys.argv[0]
    if "_p5_" in os.path.basename(main_file): return
    with open(main_file, "r", encoding="utf-8") as f: content = f.read()
    transformed = transform_source(content)
    tmp_path = os.path.abspath(os.path.join(os.path.dirname(main_file), "_p5_" + os.path.basename(main_file)))
    with open(tmp_path, "w", encoding="utf-8") as f: f.write(transformed)
    try:
        subprocess.run([sys.executable, tmp_path])
    finally:
        if os.path.exists(tmp_path): os.remove(tmp_path)
        sys.exit()

if __name__ == '__main__':
    start()
