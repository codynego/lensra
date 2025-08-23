# ai_tools/utils.py
from rembg import remove
from PIL import Image
import io

def remove_background(input_file):
    input_image = Image.open(input_file)
    output = remove(input_image)
    output_io = io.BytesIO()
    output.save(output_io, format="PNG")
    return output_io
