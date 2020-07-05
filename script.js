	var backNum = 0;

	var change_backgrounds = [["imgs/background.png", "", ]];

	document.getElementById("project_button").addEventListener("click", function() {
		location.href = "https://domsoos.github.io/projects";
	});

	document.getElementById("about_me_button").addEventListener("click", function() {
		location.href = "https://domsoos.github.io/about_me";
	});

	function projects() {
		
		location.href = "https://domsoos.github.io/projects";

		var url = "https://domsoos.github.io/projects";
		//window.location(url);
		
	}
	//Initializing
var i = 0;
var images = []; //array
var time = 3000; // time in millie seconds

//images

images[0] = "url(./Images/1.jpg)";
images[1] = "url(./Images/2.jpg)";
images[2] = "url(./Images/3.jpg)";
//function

function changeImage() {
    var el = document.getElementById('body');
    el.style.backgroundImage = images[i];
    if (i < images.length - 1) {
        i++;
    } else {
        i = 0;
    }
    setTimeout('changeImage()', time);
}

window.onload = changeImage;
	function backgroundChanger() {
  		var x = Math.floor((Math.random() * 5) + 1);
  		

  	}







