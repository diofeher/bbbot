import os
from PIL import Image
import string
import unicodedata


SIZE = 5


def save_candidate_name(path, image, icon_name, count):
    image.save(path + handle_name(icon_name) + '_' + str(count) + '.png')


def save_tmp_name(image, icon_name, count):
    image.save('images_tmp/' + handle_name(icon_name) + '_' + str(count) + '.png')


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


def handle_name(data):
    return ''.join(x for x in unicodedata.normalize('NFKD', data) if x in string.ascii_letters).lower()
