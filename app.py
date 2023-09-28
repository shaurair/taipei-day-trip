from flask import *
import mysql.connector
from mysql.connector import pooling
import json
import jwt
import datetime
from api.api_booking import booking

app=Flask(__name__, static_folder = "general", static_url_path = "/")
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

# database
MysqlConnectInfo = {
	"user" : "root",
	"password" : "root123",
	"host" : "localhost",
	"database" : "TaipeiAttr"
}
connection_pool = pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **MysqlConnectInfo)

# jwt
jwt_secret_key = 'my_taipei_trip'

# Api blueprint
app.register_blueprint(booking)

# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

# Api
@app.route("/api/attractions/")
def attraction_list():
	rsp = {}

	try:
		page = int(request.args.get("page"))
	except Exception:
		rsp["error"] = True
		rsp["message"] = "please check query string"
		return jsonify(rsp), 500

	if page < 0:
		rsp["error"] = True
		rsp["message"] = "page should not be negative"
		return jsonify(rsp), 500

	keyword = request.args.get("keyword","")
	items_in_page = 12

	rsp["nextPage"] = None
	rsp["data"] = []

	# acquire results		
	try:
		con = connection_pool.get_connection()
		cursor = con.cursor(dictionary = True)
		select_content = "SELECT id, name, category, description, address, transport, mrt, lat, lng, images FROM attraction"
		range_content = "LIMIT %s OFFSET %s"
		show_range = (items_in_page + 1, page * items_in_page)

		if keyword == "":
			compare_content = ""
			keyword_arg = ()
		else:
			compare_content = "WHERE mrt = %s or name LIKE %s"
			keyword_arg = (keyword, '%' + keyword + '%')

		cursor.execute(select_content + " " + compare_content + " " + range_content + ";", keyword_arg + show_range)
		data = cursor.fetchall()

		if len(data) == items_in_page + 1:
			rsp["nextPage"] = page + 1

		if data != None:
			rsp["data"] = data[0:items_in_page]

			# transform datatype from json data to list
			for rsp_data in rsp["data"]:
				rsp_data["images"] = json.loads(rsp_data["images"])
	except Exception as e:
		rsp = {}
		rsp["error"] = True
		rsp["message"] = str(e)
		return jsonify(rsp), 500
	finally:
		cursor.close()
		con.close()

	return json.dumps(rsp, ensure_ascii = False)

@app.route("/api/attraction/<int:attractionId>")
def attraction_id_info(attractionId):
	rsp = {}
	try:
		con = connection_pool.get_connection()
		cursor = con.cursor(dictionary = True)
		select_content = "SELECT id, name, category, description, address, transport, mrt, lat, lng, images FROM attraction"
		compare_content = "WHERE id = %s"
		keyword_arg = (attractionId, )
		cursor.execute(select_content + " " + compare_content + ";", keyword_arg)
		data = cursor.fetchone()
		if data == None:
			rsp = {}
			rsp["error"] = True
			rsp["message"] = "wrong attraction id"
			return jsonify(rsp), 400
		else:
			rsp["data"] = data
			# transform datatype from json data to list
			rsp["data"]["images"] = json.loads(rsp["data"]["images"])
	except Exception as e:
		rsp = {}
		rsp["error"] = True
		rsp["message"] = str(e)
		return jsonify(rsp), 500
	finally:
		cursor.close()
		con.close()
	return json.dumps(rsp, ensure_ascii = False)

@app.route("/api/mrts")
def mrt_list():
	rsp = {}
	try:
		con = connection_pool.get_connection()
		cursor = con.cursor()
		cursor.execute("SELECT mrt FROM attraction WHERE mrt IS NOT NULL GROUP BY mrt ORDER BY count(*) DESC LIMIT 40 OFFSET 0;")
		data = cursor.fetchall()
		rsp["data"] = [data_item[0] for data_item in data]
	except Exception as e:
		rsp = {}
		rsp["error"] = True
		rsp["message"] = str(e)
		return jsonify(rsp), 500
	finally:
		cursor.close()
		con.close()
	return json.dumps(rsp, ensure_ascii = False)

@app.route("/api/user", methods = ["POST"])
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
		
@app.route("/api/user/auth", methods = ["GET", "PUT"])
def authenticate():
	rsp={}
	# Check user log status
	if request.method == "GET":
		rsp["data"] = None
		bearer_token = request.headers.get("Authorization")
		if bearer_token.startswith('Bearer '):
			token = bearer_token.split(' ')[1]
			try:
				rsp["data"] = decoded_data = jwt.decode(token, jwt_secret_key, algorithms="HS256")
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
			payload = {"id":user_result["id"], "name": user_result["name"] , "email": email, 'exp': expiration_time}
			token = jwt.encode(payload, jwt_secret_key, algorithm='HS256')
			rsp["token"] = token
			return rsp, 200
	except Exception as e:
		rsp["error"] = True
		rsp["message"] = str(e)
		return rsp, 500
	finally:
		cursor.close()
		con.close()

app.run(host="0.0.0.0", port=3000)