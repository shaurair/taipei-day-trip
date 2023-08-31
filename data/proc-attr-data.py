import json
import re
import mysql.connector

MysqlConnectInfo = {
	"user" : "root",
	"password" : "root123",
	"host" : "localhost",
	"database" : "TaipeiAttr"
}

def get_img_urls(file):
	urltext = "https:"
	file_list = file.split(urltext)[1:]
	image_file_pattern = re.compile(r"\.(jpg|png)$", re.IGNORECASE)
	image_list = []
	for file_url in file_list:
		if re.search(image_file_pattern, file_url):
			image_list = image_list + [urltext + file_url]

	return json.dumps(image_list)

# get raw data from the json file
with open("taipei-attractions.json", mode = "r") as attr_file:
	attr_data = json.load(attr_file)

attr_list = attr_data["result"]["results"]

con = mysql.connector.connect(**MysqlConnectInfo)
cursor = con.cursor()

for attr in attr_list:
	# process date data format
	date = attr["date"].replace("/","-")
	avBegin = attr["avBegin"].replace("/","-")
	avEnd = attr["avEnd"].replace("/","-")

	# get image url from file
	image_urls = get_img_urls(attr["file"])

	# save to DB
	try:
		cursor.execute("INSERT INTO attraction(rate, transport, name, date, lng, REF_WP, avBegin, langinfo, mrt, SERIAL_NO, RowNumber, category, MEMO_TIME, POI, images, idpt, lat, description, id, avEnd, address) VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
			(attr["rate"], attr["direction"], attr["name"], date, attr["longitude"], attr["REF_WP"], avBegin, attr["langinfo"], attr["MRT"], attr["SERIAL_NO"],
			attr["RowNumber"], attr["CAT"], attr["MEMO_TIME"], attr["POI"], image_urls, attr["idpt"], attr["latitude"], attr["description"], attr["_id"], avEnd,
			attr["address"]))
		con.commit()
	except Exception as e:
		print("error:",e)

con.close()