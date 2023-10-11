async function initMember() {
	await getUser();

	if(signInMember == null) {
		location.href = "/";
	}
	else {
		loadingElement.style.display = 'none';
	}
}