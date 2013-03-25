import Image
import sys
import glob

def processImage(infile):
    try:
        im = Image.open(infile)
    except IOError:
        print "Cant load", infile
        sys.exit(1)
    i = 0
    mypalette = im.getpalette()
    out_image = Image.new("RGBA", (6000, 120));

    try:
        while 1:
            im.putpalette(mypalette)
            new_im = Image.new("RGBA", im.size)
            new_im.paste(im)
            out_image.paste(new_im, (120*i,0))

            i += 1
            im.seek(im.tell() + 1)

    except EOFError:
        pass # end of sequence
        
    out_image.save(infile[0:-4]+'.png');

if __name__ == '__main__':
    files = glob.glob("*.gif")
    for f in files:
        processImage(f)