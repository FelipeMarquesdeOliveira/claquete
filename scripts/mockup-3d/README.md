# Mockups de aparelho

As imagens de [`docs/telas/mockups/`](../../docs/telas/mockups) não são molduras
desenhadas por cima da tela: o aparelho é **renderizado em 3D**, com espessura
real, trilho metálico refletindo o ambiente, botões laterais e sombra de contato.

`cena.html` é a cena, montada em [three.js](https://threejs.org). Ela usa as
medidas físicas do iPhone X em centímetros:

| Peça | Medida |
|---|---|
| Corpo | 7,09 × 14,36 × 0,77 · canto 1,07 |
| Tela | 6,25 × 13,54 · canto 0,65 |
| Chanfro do trilho | 0,14 |
| Giro da câmera | 0,38 rad (≈ 22°) · lente de 18° |

A tela entra como textura, e a iluminação vem de um ambiente de estúdio
(`RoomEnvironment`) mais uma luz principal com sombra suave e uma luz de
contorno que acende a borda do metal.

## Como regerar

As dependências não ficam no repositório. Para rodar de novo:

```bash
npm install three          # a cena importa três módulos de vendor/
python3 -m http.server     # a cena precisa de http, não de file://
```

Abra `cena.html?tela=<nome-da-tela>` e capture o canvas. As telas de origem
estão em `docs/telas/`.

O parâmetro `&lado=direita` espelha o giro (e move a luz junto), para o
aparelho apontar para o outro lado sem espelhar o conteúdo da tela.
