from flask import *
from model.database_conn import connection_pool
from model.token import token_decode
import requests
import datetime

order = Blueprint("order",__name__)

# Tap Pay infos
tap_pay_key = "partner_zmeOFYHhh0Lcvxz65XquEeuUSDnIBzXBFhN6FeJUp4kibE96qGmOw9Zu"
sandbox_url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
my_mechant_id = "shaurair_TAISHIN"
TAPPAYSTATUSOK = 0

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
		# TODO
		return jsonify(rsp), 200

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
		headers = {
			"Content-Type": "application/json",
			"x-api-key": tap_pay_key
		}

		payload = {
			"prime": prime,
			"partner_key": tap_pay_key,
			"merchant_id": my_mechant_id,
			"details":"Taipei-day-trip TapPay Test",
			"amount": price,
			"cardholder": {
				"phone_number": contact["phone"],
				"name": contact["name"],
				"email": contact["email"]
			},
			"remember": True
		}

		tap_pay_response = requests.post(sandbox_url, json = payload, headers = headers).json()
	else:
		rsp["error"] = True
		rsp["message"] = "尚未付款，發生其他錯誤。" + add_order_msg
		return rsp, 500

	if tap_pay_response["status"] == TAPPAYSTATUSOK:
		update_order_on_db_result = update_order_on_db(add_order_msg, "已付款")

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

def update_order_on_db(order_no, status):
	rsp = {}

	try:
		con = connection_pool.get_connection()
		cursor = con.cursor()
		cursor.execute("UPDATE order_table SET status = %s WHERE order_no = %s;",(status, order_no))
		con.commit()
		return True
	except Exception as e:
		rsp["error"] = True
		rsp["message"] = str(e)
		return str(e)
	finally:
		cursor.close()
		con.close()