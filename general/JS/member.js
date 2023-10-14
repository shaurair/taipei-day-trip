const loadingElement = document.getElementById("loading");
const noneOrderElement = document.getElementById("none-order-content");
const expandOrdersElement = document.getElementById("expand-all-order");
const submitImageBtn = document.getElementById("upload-submit");
const submitSuccessElement = document.getElementById("submit-success");
const submitWaitingElement = document.getElementById("submit-waiting");
const fileInputBtn = document.getElementById('fileInput');
const changeImageElement = document.getElementById('change-image');
let isAllowSubmit = false;
let imageFile;

function setMemberInfo() {
	let element = document.getElementById("member-name");
	element.textContent = signInMember["name"];

	element = document.getElementById("member-email");
	element.textContent = signInMember["email"];

	element = document.getElementById("member-image");
	updateUserImage(element);
}

function setDetailInfo(OrderInfoContainer, headline, description) {
	let detailInfoContainer = document.createElement('div');
	let detailHeadlineElement = document.createElement('div');
	let detailDescriptionElement = document.createElement('div');

	detailInfoContainer.className = "member-item";
	OrderInfoContainer.appendChild(detailInfoContainer);

	detailHeadlineElement = document.createElement('div');
	detailHeadlineElement.className = "form-headline item-sm";
	detailHeadlineElement.textContent = headline + "：";
	detailInfoContainer.appendChild(detailHeadlineElement);

	detailDescriptionElement = document.createElement('div');
	detailDescriptionElement.className = "form-description item-sm";
	detailDescriptionElement.textContent = description;
	detailInfoContainer.appendChild(detailDescriptionElement);
}

function setOrderDetail(orderDetail) {
	for(let orderIndex = orderDetail.length - 1; orderIndex >= 0; orderIndex--) {
		let orderData = document.querySelector(".order-data");
		let newOrder = document.createElement('div');
		let newOrderHeadline = document.createElement('div');
		let newOrderContent = document.createElement('div');
		let newOrderExpandId = document.createElement('div');
		let newOrderTitle = document.createElement('div');
		let newOrderNo = document.createElement('div');

		// add new order
		newOrder.className = "member-order-info";
		orderData.appendChild(newOrder);

		// set headline and content of the new order
		setOrderHeadline(newOrder, orderIndex, orderDetail[orderIndex]["order_no"], newOrderHeadline, newOrderExpandId, newOrderTitle, newOrderNo);
		setOrderContent(newOrder, orderIndex, newOrderContent);

		// set collaspe between headline and content
		setOrderExpand(newOrderContent, newOrderHeadline, newOrderExpandId);

		// set the details of content
		setScheduleAndPrice(newOrderContent, orderDetail[orderIndex]["trip"], orderDetail[orderIndex]["price"].toString())
		setContact(newOrderContent, orderDetail[orderIndex]["contact"]);
	}
}

function setOrderHeadline(newOrder, orderIndex, orderNumber, newOrderHeadline, newOrderExpandId, newOrderTitle, newOrderNo) {
	newOrderHeadline.className = "member-item mouseover order-id";
	newOrderHeadline.id = "order-id-" + orderIndex.toString();
	newOrder.appendChild(newOrderHeadline);

	newOrderExpandId.className = "form-headline item-lg";
	newOrderExpandId.id = "expand-" + orderIndex.toString();
	newOrderExpandId.textContent = "+";
	newOrderHeadline.appendChild(newOrderExpandId);

	newOrderTitle.className = "form-headline";
	newOrderTitle.textContent = "訂單編號：";
	newOrderHeadline.appendChild(newOrderTitle);

	newOrderNo.className = "form-description item-highlight";
	newOrderNo.textContent = orderNumber;
	newOrderHeadline.appendChild(newOrderNo);
}

function setOrderContent(newOrder, orderIndex, newOrderContent) {
	newOrderContent.className = "order-detail unseen";
	newOrderContent.id ="order-" + orderIndex.toString();
	newOrder.appendChild(newOrderContent);
}

function setOrderExpand(collaspeElement, expandSwitch, expandHint) {
	expandSwitch.addEventListener('click',()=>{
		if(collaspeElement.classList.contains("unseen")) {
			collaspeElement.classList.remove("unseen");
			expandHint.textContent = "-";
		}
		else {
			collaspeElement.classList.add("unseen");
			expandHint.textContent = "+";
		}
	});
}

function setScheduleAndPrice(newOrderContent, trip, price) {
	let newOrderContentDetail = document.createElement('div');
	let scheduleAndPriceContainer = document.createElement('div');

	newOrderContentDetail.className = "member-item item-highlight";
	newOrderContentDetail.textContent = "行程";
	newOrderContent.appendChild(newOrderContentDetail);

	scheduleAndPriceContainer.className = "order-info";
	newOrderContent.appendChild(scheduleAndPriceContainer);

	setDetailInfo(scheduleAndPriceContainer, "景點名稱", trip["attraction"]["name"]);
	setDetailInfo(scheduleAndPriceContainer, "景點地址", trip["attraction"]["address"]);
	setDetailInfo(scheduleAndPriceContainer, "日期", trip["date"]);
	setDetailInfo(scheduleAndPriceContainer, "時間", (trip["time"] == "morning" ? "早上 9 點到下午 4 點" : "下午 2 點到晚上 9 點"));
	setDetailInfo(scheduleAndPriceContainer, "費用", price);
}

function setContact(newOrderContent, contact) {
	let newOrderContentDetail = document.createElement('div');
	let contactContainer = document.createElement('div');

	newOrderContentDetail.className = "member-item item-highlight";
	newOrderContentDetail.textContent = "聯絡資訊";
	newOrderContent.appendChild(newOrderContentDetail);

	contactContainer.className = "order-info";
	newOrderContent.appendChild(contactContainer);

	setDetailInfo(contactContainer, "姓名", contact["name"]);
	setDetailInfo(contactContainer, "email", contact["email"]);
	setDetailInfo(contactContainer, "手機", contact["phone"]);
}

function showDefaultUnseen(classname) {
	let defaultUnseenElement = document.getElementsByClassName(classname);
	
	for(let elementIndex = 0; elementIndex < defaultUnseenElement.length; elementIndex++) {
		defaultUnseenElement[elementIndex].classList.remove(classname);
	}
}

function disableButton() {
	submitImageBtn.style.cursor = "not-allowed";
	submitImageBtn.classList.remove("mouseover");
	isAllowSubmit = false;
}

function enableButton() {
	submitImageBtn.style.cursor = "pointer";
	submitImageBtn.classList.add("mouseover");
	submitWaitingElement.classList.add("unseen");
	submitSuccessElement.classList.add("unseen");
	isAllowSubmit = true;
}

async function initMember() {
	await getUser();

	if(signInMember == null) {
		location.href = "/";
	}
	else {
		setMemberInfo();
		await getAllBookingInfo();
		showDefaultUnseen("member-info-part");
		disableButton();
		loadingElement.style.display = 'none';
	}
}

async function getAllBookingInfo() {
	let token = localStorage.getItem('token');
	let response = await fetch("../api/orders", {
		method: "GET",
		headers: {
			'Authorization':`Bearer ${token}`,
		}
	});
	let result = await response.json();

	if(response.ok) {
		if(result["data"] != null) {
			noneOrderElement.style.display = 'none';
			setOrderDetail(result["data"]);
		}
		else {
			expandOrdersElement.style.display = 'none';
			noneOrderElement.textContent = "無歷史訂單"
			noneOrderElement.classList.add("form-description")
		}
	}
	else {
		let alertMessage = (response.status >= 500) ? "伺服器錯誤，請重新整理再試一次。" : result["message"];
		alert(alertMessage);
	}
}

async function sendImageFile() {
	let token = localStorage.getItem('token');
	let formData = new FormData();
	formData.append('photo', imageFile);
	let response = await fetch("../api/update/profile/image", {
			method: "POST",
			body: formData,
			headers: {
				'Authorization':`Bearer ${token}`,
			}
	});
	let result = await response.json();

	if(response.ok) {
		submitWaitingElement.classList.add("unseen");
		submitSuccessElement.classList.remove("unseen");
	}
	else {
		alert(result["message"]);
		submitWaitingElement.classList.add("unseen");
		disableButton();
	}
}

expandOrdersElement.addEventListener('click', ()=>{
	let orderHeadlineList = document.getElementsByClassName("order-id");
	let expandHintElement;

	for(let orderIndex = 0; orderIndex < orderHeadlineList.length; orderIndex++) {
		expandHintElement = document.getElementById("expand-" + (orderHeadlineList.length - 1 - orderIndex).toString());
		if(expandHintElement.textContent == "+") {
			orderHeadlineList[orderIndex].click();
		}
	}
});

submitImageBtn.addEventListener('click', ()=>{
	if(isAllowSubmit == true) {
		submitWaitingElement.classList.remove("unseen");
		disableButton();
		sendImageFile();
	}
});

fileInputBtn.addEventListener('change', ()=>{
	imageFile = fileInputBtn.files[0];

	enableButton();
	changeImageElement.src = URL.createObjectURL(imageFile);
});
