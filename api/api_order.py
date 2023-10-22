from flask import *
from model.database_conn import connection_pool
from utility.token import token_decode
from utility.tappay import tap_pay_request, TAPPAYSTATUSOK
import datetime

order = Blueprint("order",__name__)

# api
@order.route("/api/orders", methods = ["GET", "POST"])
def order_info():
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
		
	if request.method == "GET":
		(rsp, rsp_code) = get_order_on_db(member_id)
		return jsonify(rsp), rsp_code

	elif request.method == "POST":
		request_data = request.get_json()
		try:
			prime = request_data["prime"]
			price = request_data["order"]["price"]
			trip = request_data["order"]["trip"]
			contact = request_data["order"]["contact"]
		except Exception as e:
			rsp["error"] = True
			rsp["message"] = "請確認request內容: " + str(e)
			return jsonify(rsp), 400

		(rsp, rsp_code) = pay_by_prime(member_id, prime, price, trip, contact)
		return rsp, rsp_code

# function
def pay_by_prime(member_id, prime, price, trip, contact):
	rsp = {}
	data = {}
	payment = {}

	(add_order_on_db_success, add_order_msg) = add_order_on_db(member_id, trip, contact, price)

	if add_order_on_db_success is True:
		tap_pay_response = tap_pay_request(prime, price, contact)
	else:
		rsp["error"] = True
		rsp["message"] = "尚未付款，發生其他錯誤。" + add_order_msg
		return rsp, 500

	if tap_pay_response["status"] == TAPPAYSTATUSOK:
		update_order_on_db_result = update_order_on_db(add_order_msg, "已付款", member_id)

		if update_order_on_db_result is True:
			payment["status"] = tap_pay_response["status"]
			payment["message"] = "付款成功"
			data["payment"] = payment
			data["number"] = add_order_msg
			rsp["data"] = data
			return rsp, 200

		else:
			rsp["error"] = True
			rsp["message"] = "付款成功，但發生其他錯誤。" + update_order_on_db_result
			return rsp, 500
	else:
		payment["status"] = tap_pay_response["status"]
		payment["message"] = "付款失敗"
		data["payment"] = payment
		data["number"] = add_order_msg
		rsp["data"] = data
		return rsp, 200

def convert_to_json(data):
	for item in data:
		item["trip"] = json.loads(item["trip"])
		item["contact"] = json.loads(item["contact"])

	return data

def add_order_on_db(member_id, trip, contact, price):
	rsp = {}

	trip = json.dumps(trip)
	contact = json.dumps(contact)
	order_no = datetime.datetime.now().strftime("%Y%m%d%H%M%S")

	try:
		con = connection_pool.get_connection()
		cursor = con.cursor()
		cursor.execute("INSERT INTO order_table (member_id, trip, contact, price, status, order_no) VALUES (%s, %s, %s, %s, %s, %s);",
						(member_id, trip, contact, price, "未付款", order_no))
		con.commit()
		return True, order_no
	except Exception as e:
		rsp["error"] = True
		rsp["message"] = str(e)
		return False, str(e)
	finally:
		cursor.close()
		con.close()

def update_order_on_db(order_no, status, member_id):
	rsp = {}

	try:
		con = connection_pool.get_connection()
		cursor = con.cursor()
		cursor.execute("UPDATE order_table SET status = %s WHERE order_no = %s;",(status, order_no))
		con.commit()
		cursor.execute("DELETE FROM booking WHERE member_id = %s;",(member_id,))
		con.commit()
		return True
	except Exception as e:
		rsp["error"] = True
		rsp["message"] = str(e)
		return str(e)
	finally:
		cursor.close()
		con.close()

def get_order_on_db(member_id):
	rsp = {}
	rsp["data"] = None
	try:
		con = connection_pool.get_connection()
		cursor = con.cursor(dictionary = True)
		cursor.execute("SELECT order_no, trip, contact, price FROM order_table WHERE member_id=%s AND status = \"已付款\";",(member_id,))
		order_results = cursor.fetchall()
		if len(order_results) == 0:
			rsp["data"] = None
		else:
			order_results = convert_to_json(order_results)
			rsp["data"] = order_results
		
		return rsp, 200
	except Exception as e:
		rsp["error"] = True
		rsp["message"] = str(e)
		return rsp, 500
	finally:
		cursor.close()
		con.close()
