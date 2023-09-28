from flask import *
from model.database_conn import connection_pool

attraction = Blueprint("attraction",__name__)

# api
@attraction.route("/api/attractions/")
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

		return jsonify(rsp)
	except Exception as e:
		rsp = {}
		rsp["error"] = True
		rsp["message"] = str(e)
		return jsonify(rsp), 500
	finally:
		cursor.close()
		con.close()

@attraction.route("/api/attraction/<int:attractionId>")
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

		return jsonify(rsp)
	except Exception as e:
		rsp = {}
		rsp["error"] = True
		rsp["message"] = str(e)
		return jsonify(rsp), 500
	finally:
		cursor.close()
		con.close()
	
@attraction.route("/api/mrts")
def mrt_list():
	rsp = {}
	try:
		con = connection_pool.get_connection()
		cursor = con.cursor()
		cursor.execute("SELECT mrt FROM attraction WHERE mrt IS NOT NULL GROUP BY mrt ORDER BY count(*) DESC LIMIT 40 OFFSET 0;")
		data = cursor.fetchall()
		rsp["data"] = [data_item[0] for data_item in data]
		return jsonify(rsp)
	except Exception as e:
		rsp = {}
		rsp["error"] = True
		rsp["message"] = str(e)
		return jsonify(rsp), 500
	finally:
		cursor.close()
		con.close()