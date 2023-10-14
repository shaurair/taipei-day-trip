from flask import *
from utility.token import token_decode
from utility.file_access import save_file

update = Blueprint("update",__name__)

# api
@update.route("/api/update/profile/image", methods = ["POST"])
def update_image():
	rsp = {}
	bearer_token = request.headers.get("Authorization")
	if bearer_token.startswith('Bearer '):
		token = bearer_token.split(' ')[1]
		try:
			decoded_data = token_decode(token)
			member_id = decoded_data["id"]
		except Exception as e:
			rsp["error"] = True
			rsp["message"] = "未登入系統，拒絕存取"
			return jsonify(rsp), 403

	if 'photo' in request.files:
		photo = request.files['photo']
		if photo.filename != '' and photo.filename.endswith(('.png', '.jpg', '.jpeg', '.bmp', '.gif')):
			filename = str(member_id) + '.png'
			save_file(photo, filename, './profile_image')
			rsp["ok"] = True
			return jsonify(rsp), 200
	
	rsp["error"] = True
	rsp["message"] = "請確認檔案格式須為： .png, .jpg, .jpeg, .bmp, .gif 其中一種"
	return jsonify(rsp), 400