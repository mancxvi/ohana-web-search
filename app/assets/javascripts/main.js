/* Application functionality */

var main = (function () {
"use strict";
	var main = {};

	// initalize the application
	main.init = function()
	{
		busyManager.init();
		busyManager.hide(); // temp - immediately hide
		infoScreenManager.init(); // initialize help/info screen (in utility bar)
		searchOpManager.init(); // initialize search options screen (in utility bar)
	}

	//=================================================================================
	// manages show and hiding of splash screen
		var busyManager = (function(){
		var busyManager = {};

		var splashScreen; // loading screen

		// PUBLIC METHODS
		busyManager.init = function()
		{
			splashScreen = document.getElementById("splash-screen");
			//.success(function() { dataLoadedSuccess(); })
			//.error(function() { dataLoadedError(); })
			//.complete(function() { dataLoadedComplete(); });
		}

		// PUBLIC METHODS
		busyManager.show = function()
		{
			console.log("show splash screen");
			splashScreen.classList.remove("hide");
		}
		
		busyManager.hide = function()
		{
			console.log("hide splash screen");
			splashScreen.classList.add("hide");
		}
	
		return busyManager;
	})();

	//=================================================================================
	// manages show and hiding of info screen
	var infoScreenManager = (function(){
		var infoScreenManager = {};

		// PRIVATE PROPERTIES
		var infoScreenBtn; // help screen that covers content
		var infoScreen; // help screen that covers content

		// PUBLIC PROPERTIES
		infoScreenManager.storageName = "hrl-infoscreen";

		// PUBLIC METHODS
		infoScreenManager.init = function()
		{
			//console.log("initialized infoscreen");
			infoScreenBtn = document.getElementById("info-screen-btn");
			infoScreen = document.getElementById("info-screen");

			infoScreenBtn.addEventListener("mouseover",btnOverHandler,false);
			infoScreenBtn.addEventListener("mouseout",btnOutHandler,false);
			infoScreenBtn.addEventListener("mousedown",maximizeHandler,false);

			infoScreen.addEventListener("mousedown",minimizeHandler,false);

			if (webStorageProxy.getItem(infoScreenManager.storageName))
				infoScreenManager.minimize();
			else
				infoScreenManager.maximize();
		}

		// PUBLIC METHODS
		infoScreenManager.maximize = function()
		{
			// prevent mouseout of infoscreenbtn
			infoScreenBtn.removeEventListener("mouseout",btnOutHandler,false);

			// show info screen
			infoScreen.classList.remove("mini");
			infoScreen.classList.add("max");
		}
		
		infoScreenManager.minimize = function()
		{
			// hide info screen
			infoScreen.classList.add("mini");
			infoScreen.classList.remove("max");
			
			// enable mouseout of infoscreenbtn
			infoScreenBtn.addEventListener("mouseout",btnOutHandler,false);
			
			// record that the info screen has been seen
			webStorageProxy.setItem(infoScreen.storageName,true);
		}


		// PRIVATE METHODS
		// minimize the info/help box
		function minimizeHandler(evt)
		{
			infoScreenManager.minimize();
			// mouseout of button is cursor is not over the button
			if (infoScreenBtn != document.elementFromPoint(evt.clientX, evt.clientY) )
			{
				btnOutHandler();
			}
		}

		// expand the info/help box
		function maximizeHandler(evt)
		{
			infoScreenManager.maximize();
		}

		// rollover handlers for the minified info/help box
		function btnOverHandler(evt)
		{
			infoScreenBtn.classList.add("over");
		}

		function btnOutHandler(evt)
		{
			infoScreenBtn.classList.remove("over");
		}

		return infoScreenManager;
	})();


	//=================================================================================
	// manages show and hiding of search options screen
	var searchOpManager = (function(){
		var searchOpManager = {};

		// PRIVATE PROPERTIES
		var searchOpBtn; // minimized search options screen
		var searchOpScreen; // maximized search options screen

		// PUBLIC PROPERTIES
		searchOpManager.storageName = "hrl-searchopscreen";

		// PUBLIC METHODS
		searchOpManager.init = function()
		{
			//console.log("initialized infoscreen");
			searchOpBtn = document.querySelector("#search-options-screen-btn");
			searchOpScreen = document.querySelector("#search-options-screen");
			
			searchOpBtn.addEventListener("mouseover",miniOverHandler,false);
			searchOpBtn.addEventListener("mouseout",miniOutHandler,false);

			if (webStorageProxy.getItem(searchOpManager.storageName))
				searchOpManager.minimize();
			else
				searchOpManager.maximize();
		}

		// PUBLIC METHODS
		searchOpManager.maximize = function()
		{
			searchOpScreen.classList.remove("slide-in");
			searchOpScreen.classList.add("slide-out");

			// change content
			searchOpBtn.innerHTML = "<h1>>></h1>";

			searchOpBtn.removeEventListener("mousedown",maximizeHandler,false);	
			searchOpBtn.addEventListener("mousedown",minimizeHandler,false);
		}
		
		searchOpManager.minimize = function()
		{
			searchOpScreen.classList.remove("slide-out");
			searchOpScreen.classList.add("slide-in");

			// change content
			searchOpBtn.innerHTML = "<h1><<</h1>";	

			// setup maximize handlers
			searchOpBtn.addEventListener("mousedown",maximizeHandler,false);
		}

		// PRIVATE METHODS
		// minimize the info/help box
		function minimizeHandler(evt)
		{
			searchOpManager.minimize();
		}

		// expand the info/help box
		function maximizeHandler(evt)
		{
			searchOpManager.maximize();
		}

		// rollover handlers for the minified info/help box
		function miniOverHandler(evt)
		{
			searchOpBtn.classList.add("over");
		}

		function miniOutHandler(evt)
		{
			searchOpBtn.classList.remove("over");
		}

		return searchOpManager;
	})();

	
	//=================================================================================
	// Utility JS functions
	var util = (function(){
		var util = {};

		// get computed style (from http://stackoverflow.com/questions/2664045/how-to-retrieve-a-styles-value-in-javascript)
		util.getStyle = function(el, styleProp) {
		  var value, defaultView = (el.ownerDocument || document).defaultView;
		  // W3C standard way:
		  if (defaultView && defaultView.getComputedStyle) {
		    // sanitize property name to css notation
		    // (hypen separated words eg. font-Size)
		    styleProp = styleProp.replace(/([A-Z])/g, "-$1").toLowerCase();
		    return defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
		  } else if (el.currentStyle) { // IE
		    // sanitize property name to camelCase
		    styleProp = styleProp.replace(/\-(\w)/g, function(str, letter) {
		      return letter.toUpperCase();
		    });
		    value = el.currentStyle[styleProp];
		    // convert other units to pixels on IE
		    if (/^\d+(em|pt|%|ex)?$/i.test(value)) { 
		      return (function(value) {
		        var oldLeft = el.style.left, oldRsLeft = el.runtimeStyle.left;
		        el.runtimeStyle.left = el.currentStyle.left;
		        el.style.left = value || 0;
		        value = el.style.pixelLeft + "px";
		        el.style.left = oldLeft;
		        el.runtimeStyle.left = oldRsLeft;
		        return value;
		      })(value);
		    }
		    return value;
		  }
		}

		return util;
	})();

// return internally scoped var as value of globally scoped object
return main;

})();

	


/*
// new app object template
var search = (function () {
"use strict";

	var search = {};

	// initalize the application
	search.init = function()
	{
		
	}

	return search;

})();
*/