// variables
const deleteScheduleIcon = document.querySelector(".booking-delete-icon");

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

function setSchedulePage(scheduleData) {
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
		setSchedulePage(result["data"]);
	}
}

async function initBooking() {
	await getUser();
	
	if(signInMember == null) {
		location.pathname = "/";
	}
	else {
		setMemberInfo();
		getBookingInfo();
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

// button actions
deleteScheduleIcon.addEventListener('click',()=>{
	deleteSchedule();
});