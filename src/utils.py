import os
from PIL import Image

SIZE = 5


def save_candidate_name(path, image, icon_name, count):
    image.save(path + icon_name + '_' + str(count) + '.png')


def save_tmp_name(image, icon_name, count):
    image.save('images_tmp/'+icon_name + '_' + str(count) + '.png')


def list_individual_images(path):
    for f in os.listdir(path):
        if f in [".DS_Store", ".gitkeep"]:
            continue
        filename = path + f
        image = Image.open(filename)
        yield f, image


def break_captcha(path, icon_name, image):
    total_width = image.size[0]
    total_height = image.size[1]
    width_icon = total_width / SIZE

    for i, col in enumerate(range(0, total_width, int(width_icon))):
        coords = (col, 0, col+width_icon, total_height)
        image_icon = image.crop(coords)
        save_candidate_name(path, image_icon, icon_name, i)
        yield icon_name, image_icon
