// variables
const bookedSchedule = document.getElementById("opt-sche");

// button actions
bookedSchedule.addEventListener('click', ()=>{
	if(signInMember == null) {
		signOptElement.click();
	}
	else {
		window.location.pathname = "/booking";
	}
});