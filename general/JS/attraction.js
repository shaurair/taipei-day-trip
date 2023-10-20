let attractionId = location.href.match(/\/attraction\/(\d+)/)[1];
let attractionIdUrl = "../api/attraction/" + attractionId;
let imageSet = document.getElementsByClassName("picture-slide");
let circleSet =  document.getElementsByClassName("circle");
let currentImageIdx = 0;
const morningButton = document.getElementById("morning-button");
const afternoonButton = document.getElementById("afternoon-button");
const morningSelect = document.getElementById("morning-select");
const afternoonSelect = document.getElementById("afternoon-select");
const priceContent = document.getElementById("price-description");
const bookingButton = document.getElementById("booking-button");
const loadingElement = document.getElementById("loading");
const morningFee = "新台幣 2000 元";
const afternoonFee = "新台幣 2500 元";

// functions
function initAllData(){
	fetch(attractionIdUrl).then((response)=>{
		return response.json();
	}).then((data)=>{
		if(data["data"]) {
			createImgSet(data["data"]["images"]);
			createNameAndInformation(data["data"]);
		}
		else {
			location.href = "/";
		}

		loadingElement.style.display = 'none';
	})
}

function createImgSet(imgSources) {
	let imgSetIdx;
	let pictureContainer = document.getElementById("picture-current");
	let newImage;
	let newSvgForCircle;
	let newCircle;
	let circleContainer = document.getElementById("circle-set");

	for(imgSetIdx = 0; imgSetIdx < imgSources.length; imgSetIdx++) {
		newImage = document.createElement("img");
		newImage.src = imgSources[imgSetIdx];
		newImage.className = "picture-slide";
		pictureContainer.appendChild(newImage);

		// current pictures indicate
		newSvgForCircle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		newSvgForCircle.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		newSvgForCircle.setAttribute("width", "12");
		newSvgForCircle.setAttribute("height", "12");
		newSvgForCircle.setAttribute("viewBox", "0 0 12 12");
		newSvgForCircle.setAttribute("fill", "none");

		// Create a circle element
		newCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		newCircle.setAttribute("class", "circle");
		newCircle.setAttribute("cx", "6");
		newCircle.setAttribute("cy", "6");

		if(imgSetIdx == currentImageIdx) {
			setAsCurrentCircle(newCircle);
		}
		else {
			newImage.style.display = 'none';
			setAsOtherCircle(newCircle);
		}
		newSvgForCircle.appendChild(newCircle);
		circleContainer.appendChild(newSvgForCircle);

		(function (index) {
			newSvgForCircle.onclick = function () {
				setCurrentImageSlide(index);
			};
		})(imgSetIdx);
	}
}

function createNameAndInformation(data) {
	let element = document.getElementById("name");
	element.textContent = data["name"];

	element = document.getElementById("cate-mrt");
	element.textContent = data["category"] + ((data["mrt"] != null) ? " at " + data["mrt"] : "");

	priceContent.textContent = morningFee;

	element = document.getElementById("description");
	element.textContent = data["description"];

	element = document.getElementById("address-content");
	element.textContent = data["address"];

	element = document.getElementById("transport-content");
	element.textContent = data["transport"];
}

function pushImageSlide(deltaIdx) {
	let tmpImageIdx = (currentImageIdx + deltaIdx + imageSet.length) % imageSet.length;

	setCurrentImageSlide(tmpImageIdx);
}

function setCurrentImageSlide(imageIdx) {
	if(imageIdx != currentImageIdx) {
		imageSet[currentImageIdx].style.display = 'none';
		setAsOtherCircle(circleSet[currentImageIdx]);

		currentImageIdx = imageIdx;
		imageSet[currentImageIdx].style.display = 'block';
		setAsCurrentCircle(circleSet[currentImageIdx]);
	}
}

function setAsCurrentCircle(circle) {
	circle.setAttribute("r", "5.5");
	circle.setAttribute("fill", "black");
	circle.setAttribute("stroke", "white");
}

function setAsOtherCircle(circle) {
	circle.setAttribute("r","6");
	circle.setAttribute("fill", "white");
	circle.setAttribute("stroke", "none");
}

async function bookSchedule() {
	let date = document.getElementById("calendar").value;
	let priceSelect = priceContent.textContent;
	let time;
	let price;

	if(date == "") {
		alert("請選擇日期");
		return;
	}
	else {
		let dateDateFormat = new Date(date);
		let today = new Date();
		dateDateFormat.setHours(0, 0, 0, 0);
		today.setHours(0, 0, 0, 0);
		if(dateDateFormat < today) {
			alert("選擇日期不可早於今日");
			return;
		}
	}

	if(priceSelect == morningFee) {
		time = "morning";
		price = 2000;
	}
	else {
		time = "afternoon";
		price = 2500;
	}

	let token = localStorage.getItem('token');
	let response = await fetch("../api/booking", {
			method: "POST",
			body: JSON.stringify({
				"attractionId": attractionId,
				"date": date,
				"time": time,
				"price": price
			}),
			headers: {
				'Authorization':`Bearer ${token}`,
				'Content-Type':'application/json'
			}
	});
	let result = await response.json();

	if(result["ok"]) {
		location.href = "/booking";
	}
	else {
		console.log(result);
	}
}

function initAttraction() {
	getUser();
	initAllData();
}

// button actions
morningButton.addEventListener('click', ()=>{
	morningSelect.style.display = 'block';
	afternoonSelect.style.display = 'none';
	priceContent.textContent = morningFee;
});

afternoonButton.addEventListener('click', ()=>{
	morningSelect.style.display = 'none';
	afternoonSelect.style.display = 'block';
	priceContent.textContent = afternoonFee;
});

bookingButton.addEventListener('click',()=>{
	if(signInMember == null) {
		signOptElement.click();
	}
	else {
		bookSchedule();
	}
});