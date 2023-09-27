// variables
const signOptElement = document.getElementById("opt-sign");
const signOutElement = document.getElementById("opt-sign-out");
const signAreaElement = document.querySelector(".sign-area");
const signMaskElement = document.querySelector(".sign-mask");
const signCloseElement = document.querySelector(".close-icon");
const signInBtn = document.getElementById("sign-in-btn");
const signUpBtn = document.getElementById("sign-up-btn");
const goSignUpElement = document.getElementById("go-sign-up-btn");
const goSignInElement = document.getElementById("go-sign-in-btn");
const signInMain = document.querySelector(".sign-in-main");
const signUpMain = document.querySelector(".sign-up-main");
const bookedSchedule = document.getElementById("opt-sche");
let signInMember = null;

// functions
function checkInputFormat(name, email, password) {
	let emailRule = /^[A-Za-z0-9_.-]+\@[A-Za-z0-9_.-]+$/;

	if(name == "") {
		return "姓名未輸入";
	}
	
	if(email == "") {
		return "Email未輸入";
	}
	else if(emailRule.test(email) == false) {
		return "Email格式不正確";
	}

	if(password == "") {
		return "密碼未輸入";
	}

	return true;
}

async function signIn(email, password){
	let messageElement = document.getElementById("sign-in-message");
	let checkInputResult = checkInputFormat(null, email, password);

	messageElement.style.display = 'block';

	if(checkInputResult == true) {
		let response = await fetch("../api/user/auth", {
				method: "PUT",
				body: JSON.stringify({"email":email,
									"password":password          
				}),
				headers: {'Content-Type':'application/json'}
			});
		let result = await response.json();

		if(response.ok) {
			localStorage.setItem('token', result["token"]);
			location.reload();
		}
		else {
			messageElement.textContent = (response.status >= 500) ? "伺服器錯誤，請重新整理再試一次。" : result["message"];
		}
	}
	else {
		messageElement.textContent = checkInputResult;
	}
}

async function signUp(name, email, password){
	let messageElement = document.getElementById("sign-up-message");
	let checkInputResult = checkInputFormat(name, email, password);
	let alertColor = "rgb(150, 30, 30)";
	let confirmedColor = "rgb(30, 150, 30)";

	messageElement.style.display = 'block';
	messageElement.style.color = alertColor;

	if(checkInputResult == true) {
		let response = await fetch("../api/user", {
				method:"POST",
				body:JSON.stringify({"name":name,
									"email":email,
									"password":password          
				}),
				headers: {'Content-Type':'application/json'}
			});
		let result = await response.json();
		
		if(response.ok) {
			messageElement.textContent = "註冊成功，請登入系統";
			messageElement.style.color = confirmedColor;
		}
		else {
			messageElement.textContent = (response.status >= 500) ? "伺服器錯誤，請重新整理再試一次。" : result["message"];
		}
	}
	else {
		messageElement.textContent = checkInputResult;
	}
}

async function getUser() {
	let token = localStorage.getItem('token');
	let response = await fetch("../api/user/auth", {
			headers: {'Authorization':`Bearer ${token}`}
		});
	let result = await response.json();

	signInMember = result["data"];

	if(signInMember != null) {
		signOutElement.style.display = 'block';
		signOptElement.style.display = 'none';
	}
	else {
		signOptElement.style.opacity = 1;
	}
}

// button actions
signOptElement.addEventListener('click',()=>{
	signAreaElement.style.display = 'grid';
	signMaskElement.style.display = 'block';
});

signOutElement.addEventListener('click',()=>{
	localStorage.removeItem('token');
	location.reload();
});

signCloseElement.addEventListener('click',()=>{
	signAreaElement.style.display = 'none';
	signMaskElement.style.display = 'none';
	signInMain.style.display = 'flex';
	signUpMain.style.display = 'none';
});

signInBtn.addEventListener('click', ()=>{
	let email = document.getElementById("email").value;
	let password = document.getElementById("password").value;
	signIn(email, password);
});

signUpBtn.addEventListener('click', ()=>{
	let name = document.getElementById("sign-name").value;
	let email = document.getElementById("sign-email").value;
	let password = document.getElementById("sign-password").value;
	signUp(name, email, password);
});

goSignUpElement.addEventListener('click',()=>{
	signInMain.style.display = 'none';
	signUpMain.style.display = 'flex';
});

goSignInElement.addEventListener('click',()=>{
	signInMain.style.display = 'flex';
	signUpMain.style.display = 'none';
});

bookedSchedule.addEventListener('click', ()=>{
	if(signInMember == null) {
		signOptElement.click();
	}
	else {
		location.pathname = "/booking";
	}
});