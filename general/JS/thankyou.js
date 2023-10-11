const loadingElement = document.getElementById("loading");

function setOrderNumber() {
	let orderNumber = location.href.match(/number=(\d+)/)[1];
	let orderNumberElement = document.getElementById("order-number");
	
	orderNumberElement.textContent = orderNumber;
}

async function initThankyou() {
	await getUser();

	if(signInMember == null) {
		location.href = "/";
	}
	else {
		setOrderNumber();
		loadingElement.style.display = 'none';
	}
}