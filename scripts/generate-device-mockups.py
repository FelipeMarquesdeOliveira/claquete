"""Encaixa cada tela do app dentro de um aparelho e exporta o mockup em PNG.

A moldura é o gabarito de iPhone X / XS / 11 Pro do projeto PommePlate (CC0),
em `assets/mock/device/`. O script compõe a tela na área exata do visor, redesenha
o notch, aplica uma projeção em perspectiva de verdade (não CSS) e adiciona a
sombra projetada.

Uso: python3 scripts/generate-device-mockups.py
Requer: pillow
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

RAIZ = Path(__file__).resolve().parent.parent
FRAME = RAIZ / "assets/mock/device/iphone-frame.png"
ENTRADA = RAIZ / "docs/telas"
SAIDA = RAIZ / "docs/telas/mockups"

# Área do visor dentro do frame, medida no SVG do próprio gabarito.
VISOR = (46, 47, 1125, 2436)
RAIO_TELA = 117          # canto arredondado do visor
NOTCH = (627, 92, 42)    # largura, altura, raio (só os cantos de baixo)

ANGULO = 19              # graus de giro no eixo vertical
DISTANCIA = 3.1          # distância da câmera, em múltiplos da largura
MARGEM = 90              # espaço para a sombra
LARGURA_FINAL = 760

TELAS = [
    "1-abertura",
    "2-rodada-da-semana",
    "3-vez-do-curador",
    "4-votacao",
    "5-veredito",
    "6-placar",
]


def resolver(matriz, vetor):
    """Eliminação de Gauss com pivotamento parcial, para o sistema 8x8."""
    n = len(vetor)
    m = [linha[:] + [vetor[i]] for i, linha in enumerate(matriz)]

    for coluna in range(n):
        pivo = max(range(coluna, n), key=lambda l: abs(m[l][coluna]))
        m[coluna], m[pivo] = m[pivo], m[coluna]
        for linha in range(coluna + 1, n):
            fator = m[linha][coluna] / m[coluna][coluna]
            for k in range(coluna, n + 1):
                m[linha][k] -= fator * m[coluna][k]

    solucao = [0.0] * n
    for coluna in reversed(range(n)):
        acumulado = m[coluna][n] - sum(m[coluna][k] * solucao[k] for k in range(coluna + 1, n))
        solucao[coluna] = acumulado / m[coluna][coluna]
    return solucao


def coeficientes(destino, origem):
    """Coeficientes que o Pillow usa para mapear destino -> origem."""
    matriz, vetor = [], []
    for (dx, dy), (ox, oy) in zip(destino, origem):
        matriz.append([dx, dy, 1, 0, 0, 0, -ox * dx, -ox * dy])
        vetor.append(ox)
        matriz.append([0, 0, 0, dx, dy, 1, -oy * dx, -oy * dy])
        vetor.append(oy)
    return resolver(matriz, vetor)


def quadrilatero(largura, altura):
    """Projeta os quatro cantos girando o aparelho no eixo vertical."""
    import math

    rad = math.radians(ANGULO)
    d = DISTANCIA * largura
    meia_l, meia_a = largura / 2, altura / 2

    # a aresta esquerda vem para frente (z negativo) e cresce; a direita recua
    z_esq, z_dir = -meia_l * math.sin(rad), meia_l * math.sin(rad)
    x_esq, x_dir = -meia_l * math.cos(rad), meia_l * math.cos(rad)
    escala_esq, escala_dir = d / (d + z_esq), d / (d + z_dir)

    return [
        (x_esq * escala_esq, -meia_a * escala_esq),  # superior esquerdo
        (x_dir * escala_dir, -meia_a * escala_dir),  # superior direito
        (x_dir * escala_dir, meia_a * escala_dir),   # inferior direito
        (x_esq * escala_esq, meia_a * escala_esq),   # inferior esquerdo
    ]


def cantos_redondos(imagem, raio):
    mascara = Image.new("L", imagem.size, 0)
    ImageDraw.Draw(mascara).rounded_rectangle([(0, 0), (imagem.size[0] - 1, imagem.size[1] - 1)], raio, fill=255)
    recortada = imagem.copy()
    recortada.putalpha(mascara)
    return recortada


def montar(tela_path):
    frame = Image.open(FRAME).convert("RGBA")
    x, y, largura, altura = VISOR

    tela = Image.open(tela_path).convert("RGBA").resize((largura, altura), Image.LANCZOS)
    frame.alpha_composite(cantos_redondos(tela, RAIO_TELA), (x, y))

    # o notch fica por cima da tela, como no aparelho real
    nl, na, nr = NOTCH
    nx = x + (largura - nl) // 2
    ImageDraw.Draw(frame).rounded_rectangle(
        [(nx, y - nr), (nx + nl, y + na)], nr, fill=(0, 0, 0, 255),
        corners=(False, False, True, True),
    )
    return frame


def inclinar(imagem):
    largura, altura = imagem.size
    quad = quadrilatero(largura, altura)

    minimo_x = min(p[0] for p in quad)
    minimo_y = min(p[1] for p in quad)
    largura_final = int(max(p[0] for p in quad) - minimo_x) + MARGEM * 2
    altura_final = int(max(p[1] for p in quad) - minimo_y) + MARGEM * 2

    destino = [(p[0] - minimo_x + MARGEM, p[1] - minimo_y + MARGEM) for p in quad]
    origem = [(0, 0), (largura, 0), (largura, altura), (0, altura)]

    return imagem.transform(
        (largura_final, altura_final),
        Image.PERSPECTIVE,
        coeficientes(destino, origem),
        resample=Image.BICUBIC,
    )


def com_sombra(imagem):
    sombra = Image.new("RGBA", imagem.size, (0, 0, 0, 0))
    sombra.putalpha(imagem.getchannel("A").point(lambda a: int(a * 0.62)))
    sombra = sombra.filter(ImageFilter.GaussianBlur(34))

    tela = Image.new("RGBA", imagem.size, (0, 0, 0, 0))
    tela.alpha_composite(sombra, (10, 46))
    tela.alpha_composite(imagem)
    return tela


SAIDA.mkdir(parents=True, exist_ok=True)
print("Gerando mockups de aparelho:")
for nome in TELAS:
    resultado = com_sombra(inclinar(montar(ENTRADA / f"{nome}.png")))
    proporcao = LARGURA_FINAL / resultado.size[0]
    resultado = resultado.resize(
        (LARGURA_FINAL, round(resultado.size[1] * proporcao)), Image.LANCZOS
    )
    destino = SAIDA / f"mockup-{nome}.png"
    resultado.save(destino, optimize=True)
    print(f"  {destino.name}  {destino.stat().st_size / 1024:.0f} KB  {resultado.size[0]}x{resultado.size[1]}")
print("Pronto.")
