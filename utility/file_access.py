from flask import *
import os 

file_access = Blueprint("file_access",__name__)

@file_access.route('/profile_image/<filename>')
def get_image(filename):
	return send_from_directory('profile_image', filename)

def save_file(file, filename, directory):
	photo_path = os.path.join(directory, filename)
	file.save(photo_path)
