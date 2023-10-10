from flask import *
from model.database_conn import connection_pool
from utility.token import token_decode

booking = Blueprint("booking",__name__)

# api
@booking.route("/api/booking", methods = ["GET", "POST", "DELETE"])
def get_booking_info():
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
		rsp = check_booking_on_db(member_id)
		return jsonify(rsp), 200

	elif request.method == "POST":
		request_data = request.get_json()
		try:
			attraction_id = request_data["attractionId"]
			date = request_data["date"]
			time = request_data["time"]
			price = request_data["price"]
		except Exception as e:
			rsp["error"] = True
			rsp["message"] = "請確認request內容: " + str(e)
			return jsonify(rsp), 400

		(rsp, rsp_code) = add_booking_on_db(member_id, attraction_id, date, time, price)
		return rsp, rsp_code
	
	elif request.method == "DELETE":
		(rsp, rsp_code) = delete_booking_on_db(member_id)
		return rsp, rsp_code

# function
def check_booking_on_db(member_id):
	rsp = {}
	rsp["data"] = None
	try:
		con = connection_pool.get_connection()
		cursor = con.cursor(dictionary = True)
		cursor.execute("SELECT booking.date, booking.time, booking.price, attractionId, attraction.name, attraction.address, JSON_UNQUOTE(JSON_EXTRACT(attraction.images, '$[0]')) AS image \
						FROM booking INNER JOIN attraction ON booking.attractionId = attraction.id  WHERE member_id = %s;", (member_id,))
		booking_results = cursor.fetchone()
		if booking_results is not None:
			attraction = {}
			attraction["id"] = booking_results["attractionId"]
			attraction["name"] = booking_results["name"]
			attraction["address"] = booking_results["address"]
			attraction["image"] = booking_results["image"]
			booking_results["attraction"] = attraction
			del booking_results["attractionId"], booking_results["name"], booking_results["address"], booking_results["image"]
			booking_results["date"] = booking_results["date"].strftime("%Y-%m-%d")
			rsp["data"] = booking_results

		return rsp
	except Exception as e:
		print(e)
		return rsp
	finally:
		cursor.close()
		con.close()

def add_booking_on_db(member_id, attraction_id, date, time, price):
	rsp = {}
	try:
		con = connection_pool.get_connection()
		cursor = con.cursor()
		cursor.execute("INSERT INTO booking (member_id, attractionId, date, time, price, id) VALUES (%s, %s, %s, %s, %s, id) AS new_booking \
						ON DUPLICATE KEY UPDATE attractionId = new_booking.attractionId, date = new_booking.date, time = new_booking.time, price = new_booking.price;",
						(member_id, attraction_id, date, time, price))
		con.commit()
		rsp["ok"] = True
		return rsp, 200
	except Exception as e:
		rsp["error"] = True
		rsp["message"] = str(e)
		return rsp, 500
	finally:
		cursor.close()
		con.close()
	
def delete_booking_on_db(member_id):
	rsp = {}
	try:
		con = connection_pool.get_connection()
		cursor = con.cursor()
		cursor.execute("DELETE FROM booking WHERE member_id = %s;", (member_id, ))
		con.commit()
		rsp["ok"] = True
		return rsp, 200
	except Exception as e:
		rsp["error"] = True
		rsp["message"] = str(e)
		return rsp, 500
	finally:
		cursor.close()
		con.close()