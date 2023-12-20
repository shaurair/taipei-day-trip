from flask import *
from api.api_booking import booking
from api.api_authentication import authentication
from api.api_attraction import attraction
from api.api_order import order
from api.api_update import update
from utility.file_access import file_access

app=Flask(__name__, static_folder = "general", static_url_path = "/")
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

# Api blueprint
app.register_blueprint(booking)
app.register_blueprint(authentication)
app.register_blueprint(attraction)
app.register_blueprint(order)
app.register_blueprint(update)

# Utility function
app.register_blueprint(file_access)

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
@app.route("/member")
def member():
	return render_template("member.html")

# app.run(debug=True, host="0.0.0.0", port=3000)
app.run(port=3000)