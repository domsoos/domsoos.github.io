	var backNum = 0;

	document.getElementById("project_button").addEventListener("click", function() {
		location.href = "https://domsoos.github.io/projects";
	});

	document.getElementById("about_me").addEventListener("click", function() {
		location.href = "https://domsoos.github.io/about_me";
	});

	function projects() {
		
		location.href = "https://domsoos.github.io/projects";

		var url = "https://domsoos.github.io/projects";
		//window.location(url);
		
	}
	document.getElementById("background_changer").addEventListener("click", function() {
		backgroundChanger();
	});
	document.getElementById("time").addEventListener("click",function() {
		document.getElementById('demo').innerHTML = Date();
	});

	//Initializing
	var i = 0;
	var images = []; //array
	//var time = 3000; // time in millie seconds

	//images

	images[0] = "url(./imgs/background.png)";
	images[1] = "url(./imgs/landscape.jpeg)";
	images[2] = "url(./imgs/landscape2.jpeg)";
	//function

	function backgroundChanger() {

	    var el = document.getElementById('body');
	    var x  = Math.floor((Math.random() * images.length) + 1);

	    el.style.backgroundImage = images[x];

	    if (i < images.length - 1) {
	        i++;
	    } else {
	        i = 0;
	    }
	    //setTimeout('changeImage()', time);
	}

	//window.onload = changeImage;
		/*function backgroundChanger() {

	  		var x = Math.floor((Math.random() * 5) + 1);

	  		window.onload = images[i];
	  		for(var i=0;i<images.length();i++)
	  		{
	  			window.onload = images[i]
	  		}

	  	}*/

	  	







