import Image
import ImageDraw

def drawHexgrid():
    img = Image.open("bg.png")
    draw = ImageDraw.Draw(img)
    spec = {"width": 152.613575, "height": 76.306787, "side":60}
    x = 2300
    y = 1500
    offset = 50
    xpos = 50
    ypos = y/2 - spec["height"]/2
    matrixx = 0
    matrixy = 0
    rows = 0
    while (xpos < x/2) and (ypos - spec["height"]/2>0):
        while (matrixx <= rows) and (ypos + spec["height"]/2<y):
            if (matrixy == 0) and (xpos + spec["width"]/2 + spec["side"]/2 < x/2):
                rows = rows + 1;        
            hexagon = drawHexagon(matrixx, matrixy, xpos, ypos, spec, draw)
            ypos = ypos + spec["height"]/2
            xpos = xpos + spec["width"]/2 + spec["side"]/2
            matrixx = matrixx + 1
        matrixx = 0
        matrixy = matrixy + 1
        ypos = y/2 - spec["height"]/2*(matrixy+1)
        xpos = offset + (spec["width"]/2 + spec["side"]/2)*matrixy
    img.save("newbg.png", "png")
        
def drawHexagon(mx, my, x, y, spec, draw):
    x1 = (spec["width"] - spec["side"])/2
    y1 = spec["height"] / 2
    points = []
    points.append((x1 + x, y))
    points.append((x1 + spec["side"] + x, y))
    points.append((spec["width"] + x, y1 + y))
    points.append((x1 + spec["side"] + x, spec["height"] + y))
    points.append((x1 + x, spec["height"] + y))
    points.append((x, y1 + y))
    draw.polygon(points, fill=None, outline="white")
