
const btns = document.getElementById("btns"); 
const welcome = document.querySelector(".welcome"); 
const watchDiv = document.getElementById("watch"); 
const inp = document.getElementById("urlInp"); 
const card1 = document.querySelector(".card1");
const card2 = document.querySelector(".card2");
const back = document.querySelector(".back");
const xplor = document.querySelector(".xplor");

function create(){
	location.href="/create";
}

function triggerWatch(){
	// btns.style.display="none";	
	welcome.style.display="none";	
	watchDiv.style.display="flex";
	card1.style.display="none";
	card2.style.display="none";
	back.style.display="flex";

}
function goBack(){
	// btns.style.display="flex";	
	welcome.style.display="flex";	
	watchDiv.style.display="none";
	card1.style.display="flex";
	card2.style.display="flex";
	back.style.display="none";
}


function watch (){
		var streamUrl=inp.value;
		sessionStorage.setItem("streamUrl",streamUrl);
		location.href='/watch';

}

window.onscroll = function(ev) {
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight) / 1.5) {
        // you're at the bottom of the page
		// console.log("scroll")
		card1.classList.add("animate__fadeInLeft");
		card2.classList.add("animate__fadeInRight");
    }
};

function visible(){
	xplor.style.display="block"
	xplor.classList.add("animate__fadeInDown")
}

setTimeout(visible, 1500)

function goDown(){
	window.scrollTo(0, document.body.scrollHeight);
}