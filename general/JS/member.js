const loadingElement = document.getElementById("loading");
const noneOrderElement = document.getElementById("none-order-content");
const expandOrdersElement = document.getElementById("expand-all-order");
const collapseOrdersElement = document.getElementById("collapse-all-order");
const submitImageBtn = document.getElementById("upload-submit");
const submitDataBtn = document.getElementById("upload-member-data-submit");
const submitPasswordBtn = document.getElementById("upload-password-submit");
const submitSuccessElement = document.getElementById("submit-success");
const submitWaitingElement = document.getElementById("submit-waiting");
const submitDataSuccessElement = document.getElementById("update-success");
const submitDataWaitingElement = document.getElementById("update-waiting");
const submitPasswordSuccessElement = document.getElementById("update-password-success");
const submitPasswordWaitingElement = document.getElementById("update-password-waiting");
const submitDataStopElement = document.getElementById("update-stop");
const submitStopTextElement = document.getElementById("update-stop-txt");
const submitPasswordStopElement = document.getElementById("update-password-stop");
const submitPasswordStopTextElement = document.getElementById("update-password-stop-txt");
const changeNameElement = document.getElementById("change-name-txt");
const changeEmailElement = document.getElementById("change-email-txt");
const fileInputBtn = document.getElementById('fileInput');
const changeImageElement = document.getElementById('change-image');
const editDataBtn = document.getElementById('edit-data');
const editDataElement = document.getElementById('edit-data-area');
const editPasswordBtn = document.getElementById('edit-password');
const editPasswordElement = document.getElementById('edit-password-area');
const editImageBtn = document.getElementById('edit-image');
const editImageElement = document.getElementById('edit-image-area');
const memberInfoAreaElement = document.getElementById('member-info-area');
let isAllowSubmit = false;
let isAllowDataSubmit = true;
let isAllowPasswordSubmit = true;
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

function disableDataButton() {
	submitDataBtn.style.cursor = "not-allowed";
	submitDataBtn.classList.remove("mouseover");
	isAllowDataSubmit = false;
}

function disablePasswordButton() {
	submitPasswordBtn.style.cursor = "not-allowed";
	submitPasswordBtn.classList.remove("mouseover");
	isAllowPasswordSubmit = false;
}

function enableButton() {
	submitImageBtn.style.cursor = "pointer";
	submitImageBtn.classList.add("mouseover");
	submitWaitingElement.classList.add("unseen");
	submitSuccessElement.classList.add("unseen");
	isAllowSubmit = true;
}

function enableDataButton() {
	submitDataBtn.style.cursor = "pointer";
	submitDataBtn.classList.add("mouseover");
	isAllowDataSubmit = true;
}

function enablePasswordButton() {
	submitPasswordBtn.style.cursor = "pointer";
	submitPasswordBtn.classList.add("mouseover");
	isAllowPasswordSubmit = true;
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
			collapseOrdersElement.style.display = 'none';
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
	let response = await fetch("../api/profile/image", {
			method: "PUT",
			body: formData,
			headers: {
				'Authorization':`Bearer ${token}`,
			}
	});
	let result = await response.json();

	if(response.ok) {
		submitWaitingElement.classList.add("unseen");
		submitSuccessElement.classList.remove("unseen");
		alert("更新成功！頁面將自動跳轉");
		location.href = "/member";
	}
	else {
		alert(result["message"]);
		submitWaitingElement.classList.add("unseen");
		disableButton();
	}
}

async function updateData(name, email) {
	let token = localStorage.getItem('token');
	let response = await fetch("../api/profile/data", {
			method: "PUT",
			body: JSON.stringify({
				"name":name,
				"email":email          
			}),
			headers: {
				'Authorization':`Bearer ${token}`,
				'Content-Type':'application/json'
			}
	});
	let result = await response.json();

	if(response.ok) {
		submitDataWaitingElement.classList.add("unseen");
		submitDataSuccessElement.classList.remove("unseen");
		localStorage.setItem('token', result["token"]);
		alert("更新成功！頁面將自動跳轉");
		location.href = "/member";
	}
	else {
		if(response.status >= 500) {
			alert("發生錯誤，請重新整理再試一次");
		}
		else {
			alert(result["message"]);
		}

		submitDataWaitingElement.classList.add("unseen");
		enableDataButton();
	}
}

async function updatePassword(oldPassword, newPassword) {
	let token = localStorage.getItem('token');
	let response = await fetch("../api/profile/password", {
			method: "PUT",
			body: JSON.stringify({
				"old-password":oldPassword,
				"new-password":newPassword
			}),
			headers: {
				'Authorization':`Bearer ${token}`,
				'Content-Type':'application/json'
			}
	});
	let result = await response.json();

	if(response.ok) {
		submitPasswordWaitingElement.classList.add("unseen");
		submitPasswordSuccessElement.classList.remove("unseen");
		alert("更新成功！頁面將自動跳轉，稍後請重新登入");
		localStorage.removeItem('token');
		location.href = "/";
	}
	else {
		if(response.status >= 500) {
			alert("發生錯誤，請重新整理再試一次");
		}
		else {
			alert(result["message"]);
		}
		
		submitPasswordWaitingElement.classList.add("unseen");
		enablePasswordButton();
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

collapseOrdersElement.addEventListener('click', ()=>{
	let orderHeadlineList = document.getElementsByClassName("order-id");
	let expandHintElement;

	for(let orderIndex = 0; orderIndex < orderHeadlineList.length; orderIndex++) {
		expandHintElement = document.getElementById("expand-" + (orderHeadlineList.length - 1 - orderIndex).toString());
		if(expandHintElement.textContent == "-") {
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

submitDataBtn.addEventListener('click', ()=>{
	if(isAllowDataSubmit == true) {
		if(changeNameElement.value == "" || changeEmailElement.value == "") {
			submitDataStopElement.classList.remove("unseen");
			submitStopTextElement.textContent = "請輸入姓名/Email資料";
			return;
		}
		
		if(changeNameElement.value == signInMember["name"] && changeEmailElement.value == signInMember["email"]) {
			submitDataStopElement.classList.remove("unseen");
			submitStopTextElement.textContent = "輸入的資料與現有資料相同";
			return;
		}

		let emailRule = /^[A-Za-z0-9_.-]+\@[A-Za-z0-9_.-]+$/;

		if(emailRule.test(changeEmailElement.value) == false) {
			submitDataStopElement.classList.remove("unseen");
			submitStopTextElement.textContent = "Email格式不正確";
			return;
		}

		submitDataStopElement.classList.add("unseen");
		submitDataWaitingElement.classList.remove("unseen");
		disableDataButton();
		updateData(changeNameElement.value, changeEmailElement.value);
	}
});

submitPasswordBtn.addEventListener('click', ()=> {
	let oldPasswordElement = document.getElementById("old-password-txt");
	let newPasswordElement = document.getElementById("new-password-txt");
	let confirmPasswordElement = document.getElementById("confirm-new-password-txt");

	if(isAllowPasswordSubmit == true) {
		if(oldPasswordElement.value == "" || newPasswordElement.value == "" || confirmPasswordElement.value == "") {
			submitPasswordStopElement.classList.remove("unseen");
			submitPasswordStopTextElement.textContent = "請確認舊密碼、新密碼、新密碼確認均已輸入";
			return;
		}

		if(newPasswordElement.value == oldPasswordElement.value) {
			submitPasswordStopElement.classList.remove("unseen");
			submitPasswordStopTextElement.textContent = "新密碼與舊密碼不可相同";
			return;
		}

		if(newPasswordElement.value != confirmPasswordElement.value) {
			submitPasswordStopElement.classList.remove("unseen");
			submitPasswordStopTextElement.textContent = "新密碼與新密碼確認輸入內容不一致";
			return;
		}

		submitPasswordStopElement.classList.add("unseen");
		submitPasswordWaitingElement.classList.remove("unseen");
		disablePasswordButton();
		updatePassword(oldPasswordElement.value, newPasswordElement.value)
	}
});

fileInputBtn.addEventListener('change', ()=>{
	imageFile = fileInputBtn.files[0];

	enableButton();
	changeImageElement.src = URL.createObjectURL(imageFile);
	changeImageElement.classList.remove("unseen");
});

editImageBtn.addEventListener('click', ()=>{
	if(editImageBtn.textContent == "取消編輯") {
		editImageElement.classList.add("unseen");
		memberInfoAreaElement.classList.remove("unseen");
		editDataBtn.classList.remove("unseen");
		editPasswordBtn.classList.remove("unseen");
		editImageBtn.textContent = "修改大頭貼";
	}
	else {
		editImageElement.classList.remove("unseen");
		memberInfoAreaElement.classList.add("unseen");
		editDataBtn.classList.add("unseen");
		editPasswordBtn.classList.add("unseen");
		editImageBtn.textContent = "取消編輯";
	}
});

editPasswordBtn.addEventListener('click', ()=>{
	if(editPasswordBtn.textContent == "取消編輯") {
		editPasswordElement.classList.add("unseen");
		memberInfoAreaElement.classList.remove("unseen");
		editDataBtn.classList.remove("unseen");
		editImageBtn.classList.remove("unseen");
		editPasswordBtn.textContent = "修改密碼";
	}
	else {
		editPasswordElement.classList.remove("unseen");
		memberInfoAreaElement.classList.add("unseen");
		editDataBtn.classList.add("unseen");
		editImageBtn.classList.add("unseen");
		editPasswordBtn.textContent = "取消編輯";
	}
});

editDataBtn.addEventListener('click', ()=>{
	if(editDataBtn.textContent == "取消編輯") {
		editDataElement.classList.add("unseen");
		memberInfoAreaElement.classList.remove("unseen");
		editPasswordBtn.classList.remove("unseen");
		editImageBtn.classList.remove("unseen");
		editDataBtn.textContent = "修改資本資料";
	}
	else {
		editDataElement.classList.remove("unseen");
		memberInfoAreaElement.classList.add("unseen");
		changeNameElement.value = signInMember["name"];
		changeEmailElement.value = signInMember["email"];
		editPasswordBtn.classList.add("unseen");
		editImageBtn.classList.add("unseen");
		editDataBtn.textContent = "取消編輯";
	}
});
