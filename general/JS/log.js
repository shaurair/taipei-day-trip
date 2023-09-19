// variables
const signOptElement = document.getElementById("opt-sign");
const signAreaElement = document.querySelector(".sign-area");
const signMaskElement = document.querySelector(".sign-mask");
const signCloseElement = document.querySelector(".close-icon");
const signInBtn = document.getElementById("sign-in-btn");
const signUpBtn = document.getElementById("sign-up-btn");
const goSignUpElement = document.getElementById("go-sign-up-btn");
const goSignInElement = document.getElementById("go-sign-in-btn");
const signInMain = document.querySelector(".sign-in-main");
const signUpMain = document.querySelector(".sign-up-main");

// functions
function checkEmpty(...itemList) {
	for(let item of itemList) {
		if(item == "") {
			return true;
		}
	}
	return false;
}

async function signIn(email, password){
	let messageElement = document.getElementById("sign-in-message");
	
	messageElement.style.display = 'block';

	if(checkEmpty(email,password)) {
		messageElement.textContent = "請確認Email和密碼均已輸入";
	}
	else {
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
}

async function signUp(name, email, password){
	let messageElement = document.getElementById("sign-up-message");
	let alertColor = "rgb(150, 30, 30)";
	let confirmedColor = "rgb(30, 150, 30)";

	messageElement.style.display = 'block';
	messageElement.style.color = alertColor;

	if(checkEmpty(name, email, password)) {
		messageElement.textContent = "請確認姓名、Email和密碼均已輸入";
	}
	else {
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
}

// button actions
signOptElement.addEventListener('click',()=>{
	signAreaElement.style.display = 'grid';
	signMaskElement.style.display = 'block';
	
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