from flask import *
import datetime
from utility.token import token_decode, token_encode
from utility.file_access import save_file
from model.database_conn import connection_pool

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

@update.route("/api/update/profile/name", methods = ["POST"])
def update_name():
	rsp = {}
	bearer_token = request.headers.get("Authorization")
	if bearer_token.startswith('Bearer '):
		token = bearer_token.split(' ')[1]
		try:
			decoded_data = token_decode(token)
			member_id = decoded_data["id"]
			email = decoded_data["email"]
		except Exception as e:
			rsp["error"] = True
			rsp["message"] = "未登入系統，拒絕存取"
			return jsonify(rsp), 403

	request_data = request.get_json()
	try:
		name = request_data["name"]
	except Exception as e:
		rsp["error"] = True
		rsp["message"] = "請確認request內容: " + str(e)
		return jsonify(rsp), 400

	(rsp, rsp_code) = change_name_on_db(member_id, name, email)
	return jsonify(rsp), rsp_code

def change_name_on_db(member_id, name, email):
	rsp = {}
	try:
		con = connection_pool.get_connection()
		cursor = con.cursor()
		cursor.execute("UPDATE member SET name = %s WHERE id = %s;",(name, member_id))
		con.commit()
		expiration_time = datetime.datetime.utcnow() + datetime.timedelta(days = 7)
		payload = {"id":member_id, "name": name, "email": email, 'exp': expiration_time}
		token = token_encode(payload)
		rsp["ok"] = True
		rsp["token"] = token
		return rsp, 200
	except Exception as e:
		rsp["error"] = True
		rsp["message"] = str(e)
		return rsp, 500
	finally:
		cursor.close()
		con.close()
