// variables
const deleteScheduleIcon = document.querySelector(".booking-delete-icon");
const submitOrderBtn = document.getElementById("pay-button");
let scheduleData;
// Tap Pay infos
const tapPayAppId = 137096;
const tapPayKey = "app_Tv7tRFXPSw5jHQTbcISpcmLOOYvDKIPMAMCEr2AtGtoWuYvHaQJfeY8Qkrhc";
let isOkGetPrime = false;

function setMemberInfo() {
	let element = document.getElementById("book-name");
	element.textContent = signInMember["name"];
}

function setNoneSchedulePage() {
	let bookedInfoElement = document.getElementsByClassName("booked-info-part");
	let noneBookedElement = document.getElementsByClassName("none-booked-info-part");
	let elementIndex;

	for(elementIndex = 0; elementIndex < bookedInfoElement.length; elementIndex++) {
		bookedInfoElement[elementIndex].style.display = 'none';
	}

	for(elementIndex = 0; elementIndex < noneBookedElement.length; elementIndex++) {
		noneBookedElement[elementIndex].style.display = 'block';
	}
}

function setSchedulePage() {
	let element = document.querySelector(".booking-image");
	element.src = scheduleData["attraction"]["image"];

	element = document.querySelector(".content-frame");
	element.textContent = "台北一日遊：" + scheduleData["attraction"]["name"];

	element = document.getElementById("sub-content-date");
	element.textContent = scheduleData["date"];

	element = document.getElementById("sub-content-time");
	element.textContent = (scheduleData["time"] == "morning") ? "早上 9 點到下午 4 點" : "下午 2 點到晚上 9 點";

	element = document.getElementById("sub-content-price");
	element.textContent = scheduleData["price"];

	element = document.getElementById("sub-content-address");
	element.textContent = scheduleData["attraction"]["address"];

	element = document.getElementById("booking-name");
	element.value = signInMember["name"];

	element = document.getElementById("booking-email");
	element.value = signInMember["email"];

	element = document.querySelector(".confirm-price");
	element.textContent = "總價：新台幣 " + scheduleData["price"] + " 元";
}

function setTapPay() {
	TPDirect.setupSDK(tapPayAppId, tapPayKey, 'sandbox');

	TPDirect.card.setup({
		fields: {
			number: {
				element: '#card-number',
				placeholder: '**** **** **** ****'
			},
			expirationDate: {
				element: '#exp-date',
				placeholder: 'MM / YY'
			},
			ccv: {
				element: '#card-verify',
				placeholder: 'CVV'
			}
		},
		styles: {
			'input': {
				'color': 'black'
			},
			'.valid': {
				'color': 'green'
			},
			'.invalid': {
				'color': 'red'
			}
		},

		isMaskCreditCardNumber: true,
		maskCreditCardNumberRange: {
			beginIndex: 6, 
			endIndex: 11
		}
	});

	TPDirect.card.onUpdate(function (update) {
		if(update.canGetPrime) {
			isOkGetPrime = true;
		}
		else {
			isOkGetPrime = false;
		}
	})
}

function setOrderByTapPay(contact) {
	const tappayStatus = TPDirect.card.getTappayFieldsStatus();

	if(tappayStatus.canGetPrime === false) {
		alert("信用卡確認異常");
		console.log('can not get prime');
		return;
	}

	TPDirect.card.getPrime((result) => {
		if(result.status !== 0) {
			alert("信用卡確認異常");
			console.log('get prime error ' + result.msg);
			return;
		}
		
		sendOrder(result.card.prime, contact);
	});
}

function getContact() {
	let contact = {};
	let element = document.getElementById("booking-name");
	contact["name"] = element.value;

	element = document.getElementById("booking-email");
	contact["email"] = element.value;

	element = document.getElementById("booking-mobile");
	contact["phone"] = element.value;

	if(contact["name"] == "" || contact["email"] == "" || contact["phone"] == "" ) {
		return null;
	}

	return contact;
}

async function getBookingInfo() {
	let token = localStorage.getItem('token');
	let response = await fetch("../api/booking", {
			headers: {
				'Authorization':`Bearer ${token}`,
			}
	});
	let result = await response.json();

	if(result["data"] == null) {
		setNoneSchedulePage();
	}
	else {
		scheduleData = result["data"]
		setSchedulePage();
	}
}

async function initBooking() {
	await getUser();
	
	if(signInMember == null) {
		location.pathname = "/";
	}
	else {
		setMemberInfo();
		await getBookingInfo();
		setTapPay();
	}
}

async function deleteSchedule() {
	let token = localStorage.getItem('token');
	let response = await fetch("../api/booking", {
			method: "DELETE",	
			headers: {
				'Authorization':`Bearer ${token}`,
			}
	});
	let result = await response.json();

	if(result["ok"]) {
		location.reload();
	}
	else {
		console.log(result);
	}
}

async function sendOrder(tapPayPrime, contact) {
	let token = localStorage.getItem('token');
	let response = await fetch("../api/orders", {
		method: "POST",
		body: JSON.stringify({
			"prime": tapPayPrime,
			"order": {
				"price": scheduleData["price"],
				"trip": {
					"attraction": scheduleData["attraction"],
					"date": scheduleData["date"],
					"time": scheduleData["time"]
				},
				"contact": contact
			}
		}),
		headers: {
			'Authorization':`Bearer ${token}`,
			'Content-Type':'application/json'
		}
	});
	let result = await response.json();

	if(response.ok) {
		if(result["data"]["payment"]["message"] == "付款成功") {
			location.href = "/thankyou?number=" + result["data"]["number"];
		}
		else {
			alert("付款失敗，請確認信用卡")
		}
	}
	else {
		let alertMessage = (response.status >= 500) ? "伺服器錯誤，請重新整理再試一次。" : result["message"];
		alert(alertMessage);
	}
}

// button actions
deleteScheduleIcon.addEventListener('click',()=>{
	deleteSchedule();
});

submitOrderBtn.addEventListener('click',()=>{
	let contact = getContact();
	if(contact == null) {
		alert("請確認聯絡資訊均已填入");
		return;
	}

	if(isOkGetPrime) {
		setOrderByTapPay(contact);
	}
	else {
		alert("信用卡資訊有誤");
	}
})