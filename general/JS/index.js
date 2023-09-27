// variables
const previousBtn = document.querySelector('#left-button');
const nextBtn = document.querySelector('#right-button');
const listFrame = document.getElementById("listItems");
const searchBtn = document.querySelector('#search-btn');
const keyword = document.getElementById("keyword");
const attrGroupElement = document.getElementById("attractions-group");
const barSlideBuffer = 50;
// scroll-to-end detect
const endTargetElement = document.querySelector('#main-end');
const endTargetDetectOptions = {
	root: null, // viewport
	rootMargin: '0px',
	threshold: [0,1], // any ratio of element
};
let nextPage = null;
let dataReceiveDone = false;
let searchApiPage = "api/attractions?page=";
let searchKeyword = "";

// functions
function createMrtElement(mrtName, mrtIdx){
	let newMrtDiv = document.createElement('div');
	newMrtDiv.className = 'item';
	newMrtDiv.id = "mrt" + mrtIdx;
	newMrtDiv.onclick = function(){
		searchMRT(mrtName);
	};

	let mrtContainer = document.getElementById("list-item-all");
	mrtContainer.appendChild(newMrtDiv);

	let newMrtTxtDiv = document.createElement('div');
	newMrtTxtDiv.className = 'item-text';
	newMrtTxtDiv.textContent = mrtName;
	
	let txtLength = mrtName.length * 16;
	newMrtTxtDiv.width = txtLength + "px";

	mrtContainer = document.getElementById(newMrtDiv.id);
	mrtContainer.appendChild(newMrtTxtDiv);
}

function loadMrtList(){
	fetch("api/mrts").then(function(response){
		return response.json();
	}).then(function(data){
		let mrtList = data["data"];
		let totalMrt = mrtList.length;
		for(let mrtIdx = 0; mrtIdx < totalMrt; mrtIdx++){
			createMrtElement(mrtList[mrtIdx], mrtIdx);
		}
	});
}

function createAttrElement(attrData, attrIdx){
	let newAttrDiv = document.createElement('div');
	newAttrDiv.className = 'attraction';
	newAttrDiv.id = "attr" + attrIdx;
	addMouseActionEffect(newAttrDiv);

	let attrContainer = document.getElementById("attractions-group");
	attrContainer.appendChild(newAttrDiv);

	let newAttrLink = document.createElement('a');
	newAttrLink.href = "/attraction/" + attrData["id"];
	newAttrLink.className = "hyperlink";
	newAttrLink.appendChild(newAttrDiv);
	attrContainer.appendChild(newAttrLink);

	let newPicDiv = document.createElement('div');
	newPicDiv.className = 'attr-pic';
	newAttrDiv.appendChild(newPicDiv);

	let newAttrImg = document.createElement('img');
	newAttrImg.className = 'attr-Img';
	newAttrImg.src = attrData["images"][0];
	newPicDiv.appendChild(newAttrImg);

	let newNamePlaceDiv = document.createElement('div');
	newNamePlaceDiv.className = 'attr-name-place';
	newPicDiv.appendChild(newNamePlaceDiv);

	let newTxtNameDiv = document.createElement('div');
	newTxtNameDiv.className= 'txt-name';
	newTxtNameDiv.textContent = attrData["name"];
	newNamePlaceDiv.appendChild(newTxtNameDiv);

	let newNoteDiv = document.createElement('div');
	newNoteDiv.className = 'attr-note';
	newAttrDiv.appendChild(newNoteDiv);

	let newInfosDiv = document.createElement('div');
	newInfosDiv.className= 'infos';
	newNoteDiv.appendChild(newInfosDiv);

	let newTxtMrtDiv = document.createElement('div');
	newTxtMrtDiv.className= 'txt-mrt';
	newTxtMrtDiv.textContent = attrData["mrt"];
	newInfosDiv.appendChild(newTxtMrtDiv);

	let newTxtCateDiv = document.createElement('div');
	newTxtCateDiv.className= 'txt-cate';
	newTxtCateDiv.textContent = attrData["category"];
	newInfosDiv.appendChild(newTxtCateDiv);
}

function loadAttractions(url){
	fetch(url).then(function(response){
		return response.json();
	}).then(function(data){
		let attrList = data["data"];
		let totalAttr = attrList.length;
		nextPage = data["nextPage"];

		let footer = document.querySelector('#footer');
		if(nextPage != null) {
			footer.style.display = 'none';
			endReachedObserver.observe(endTargetElement);
		}
		else {
			footer.style.display = 'flex';
			endReachedObserver.unobserve(endTargetElement);
		}

		if(attrList == "") {
			attrGroupElement.textContent = "No result found.";
		}
		else {
			for(let attrIdx = 0; attrIdx < totalAttr; attrIdx++){
				createAttrElement(attrList[attrIdx], attrIdx);
			}
		}
		
		dataReceiveDone = true;
	});
}

function removeAttractionGroup(){
	footer.style.display = 'none';
	attrGroupElement.innerHTML = "";
}

function freshSearchKeyword(){
	removeAttractionGroup();
	endReachedObserver.unobserve(endTargetElement);
	searchKeyword = "&keyword=" + keyword.value;
	dataReceiveDone = false;
	loadAttractions(searchApiPage + "0" + searchKeyword);
}

function searchMRT(mrtName){
	keyword.value = mrtName;
	freshSearchKeyword();
}

function addMouseActionEffect(element) {
	element.addEventListener('mouseover', () => {
		element.style.opacity = 0.75;
	});

	element.addEventListener('mouseout', () => {
		element.style.opacity = 1;
	});
}

function initIndex() {
	getUser();
	loadMrtList();
	loadAttractions(searchApiPage + "0");
}

// mrt slide bar
nextBtn.addEventListener('click', () => {
	listFrame.scrollLeft += (listFrame.clientWidth - barSlideBuffer);
});

previousBtn.addEventListener('click', () => {
	listFrame.scrollLeft -= (listFrame.clientWidth - barSlideBuffer);
});

// search keyword
searchBtn.addEventListener('click', () => {
	freshSearchKeyword();
});

keyword.addEventListener('keypress', (event) => {
	if(event.key === 'Enter') {
		searchBtn.click();
	}
})

const endReachedObserver = new IntersectionObserver(entries => {
	entries.forEach(entry => {
		if(entry.isIntersecting){
			if(nextPage != null){
				if(dataReceiveDone){
					dataReceiveDone = false;
					loadAttractions(searchApiPage + nextPage.toString() + searchKeyword);
				}
			}
		}
	});
}, endTargetDetectOptions);