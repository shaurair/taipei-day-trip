from flask import *
import json
import datetime
from model.database_conn import connection_pool
from utility.token import token_decode, token_encode

authentication = Blueprint("authentication",__name__)

# api
@authentication.route("/api/user", methods = ["POST"])
def signup():
	rsp={}
	request_data = request.get_json()
	try:
		name = request_data["name"]
		email = request_data["email"]
		password = request_data["password"]
	except Exception as e:
		rsp["error"] = True
		rsp["message"] = "請確認request內容: " + str(e)
		return jsonify(rsp), 400

	(rsp, rsp_code) = signup_on_db(name, email, password)
	return jsonify(rsp), rsp_code
		
@authentication.route("/api/user/auth", methods = ["GET", "PUT"])
def authenticate():
	rsp={}
	# Check user log status
	if request.method == "GET":
		rsp["data"] = None
		bearer_token = request.headers.get("Authorization")
		if bearer_token.startswith('Bearer '):
			token = bearer_token.split(' ')[1]
			try:
				rsp["data"] = decoded_data = token_decode(token)
				del rsp["data"]["exp"]
			except Exception as e:
				pass
			
		return jsonify(rsp), 200
	# Check user log in info
	elif request.method == "PUT":
		try:
			request_data = request.get_json()
			email = request_data["email"]
			password = request_data["password"]
		except Exception as e:
			rsp["error"] = True
			rsp["message"] = "請確認request內容: " + str(e)
			return jsonify(rsp), 400

		(rsp, rsp_code) = check_signin_on_db(email, password)
		return jsonify(rsp), rsp_code

# function
def signup_on_db(name, email, password):
	rsp = {}
	try:
		con = connection_pool.get_connection()
		cursor = con.cursor()
		cursor.execute("SELECT * FROM member WHERE email = %s COLLATE utf8mb4_bin",(email, ))
		existed_emails = cursor.fetchone()
		if existed_emails is None:
			try:
				cursor.execute("INSERT INTO member(name, email, password) VALUES(%s, %s, %s)",(name, email, password))
				con.commit()
				rsp["ok"] = True
				return rsp, 200
			except Exception as e:
				rsp["error"] = True
				rsp["message"] = str(e)
				return rsp, 500
		else:
			rsp["error"] = True
			rsp["message"] = "輸入的 Email 已被使用"
			return rsp, 400
	except Exception as e:
		rsp["error"] = True
		rsp["message"] = str(e)
		return rsp, 500
	finally:
		cursor.close()
		con.close()
	
def check_signin_on_db(email, password):
	rsp = {}
	try:
		con = connection_pool.get_connection()
		cursor = con.cursor(dictionary = True)
		cursor.execute("SELECT * FROM member WHERE email = %s and password = %s COLLATE utf8mb4_bin",(email, password))
		user_result = cursor.fetchone()
		if user_result is None:
			rsp["error"] = True
			rsp["message"] = "輸入的 Email 或密碼錯誤"
			return rsp, 400
		else:
			expiration_time = datetime.datetime.utcnow() + datetime.timedelta(days = 7)
			payload = {"id":user_result["id"], "name": user_result["name"], "email": email, 'exp': expiration_time}
			token = token_encode(payload)
			rsp["token"] = token
			return rsp, 200
	except Exception as e:
		rsp["error"] = True
		rsp["message"] = str(e)
		return rsp, 500
	finally:
		cursor.close()
		con.close()