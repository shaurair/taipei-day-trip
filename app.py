from flask import *
import mysql.connector
from mysql.connector import pooling
import json

app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

MysqlConnectInfo = {
	"user" : "root",
	"password" : "root123",
	"host" : "localhost",
	"database" : "TaipeiAttr"
}

connection_pool = pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **MysqlConnectInfo)

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
		show_range = (items_in_page, page * items_in_page)

		if keyword == "":
			compare_content = ""
			execute_arg = show_range
			keyword_arg = ()
		else:
			compare_content = "WHERE mrt = %s or name LIKE %s"
			keyword_arg = (keyword, '%' + keyword + '%')

		cursor.execute(select_content + " " + compare_content + " " + range_content + ";", keyword_arg + show_range)
		data = cursor.fetchall()

		select_content = "SELECT count(*) FROM attraction"
		cursor.execute(select_content+ " " + compare_content + ";",keyword_arg)
		total_result = cursor.fetchone()

		if total_result["count(*)"] > (page + 1) * items_in_page:
			rsp["nextPage"] = page + 1

		if data != None:
			rsp["data"] = data

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

app.run(host="0.0.0.0", port=3000)