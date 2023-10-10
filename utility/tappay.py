import os
from dotenv import load_dotenv
import requests

load_dotenv()

# Tap Pay infos
tap_pay_key = os.getenv("TAP_PAY_KEP")
sandbox_url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
my_mechant_id = os.getenv("MY_MECHANT_ID")
TAPPAYSTATUSOK = 0

def tap_pay_request(prime, price, contact):
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

	return requests.post(sandbox_url, json = payload, headers = headers).json()