function getDomain(url) {
	return url.replace("http://", "").replace("https://", "").split("/")[0];
}

function getPath(url) {
	var pth = url.replace("://", "");
	return pth.substr(pth.indexOf("/"));
}

// Default element to replace with loaded content
var defaultElement = null;
// The event to be fired when a page starts being loaded
// Params: event (object). Fields: url
var onPageLoading = function (event) {};
// The event to be fired when a page is loaded
// Params: event (object). Fields: url, status, content
var onPageLoaded = function (event) {};
// The event to be fired when a page encounters an error while loading
// Params: event (object). Fields: url, status, content
var onPageLoadError = function (event) {};

// Internal vars
var routes = {};
var domain = getDomain(location.toString());
var path = getPath(location.toString());
var checker = null;

function load(url, ok, error, method) {
	var len = 0;
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.status == 200) {
			if (this.responseText.length != len) {
				let obj = {
					content: this.responseText,
					url: this.responseURL,
					status: this.status
				};
				ok(obj);
				len = this.responseText.length;
			}
		} else if (this.status > 0) {
			if (error != undefined) {
				error(this);
			}
		}
	};
	var mthd = "GET";
	if (method != undefined) {
		mthd = method;
	}
	xhttp.open(mthd, url, true);
	xhttp.send();
}

function linkHook(e) {
	if (getDomain(e.currentTarget.href) == domain) {
		e.preventDefault();
		var loc = e.currentTarget.href.replace("://", "");
		if(loc.endsWith("/")) {
			loc.substr(0, loc.length-1);
		}
		loc = loc.substr(loc.indexOf("/"));
		loadPage(loc);
	}
}

function addLinkHooks() {
	var links = document.getElementsByTagName("a");
	for (var i = 0; i < links.length; i++) {
		links[i].onclick = linkHook;
	}
}
addLinkHooks();

function loadPage(pth, noState, element) {
	let proceed = true;
	if (typeof (onPageLoading) == "function") {
		var result = onPageLoading({
			url: pth
		});
		if (typeof (result) == "boolean") {
			proceed = result;
		}
	}
	if (proceed) {
		var elem = element;
		if (!element) {
			elem = defaultElement;
		}
		path = pth;
		if (!noState) window.history.pushState("{urlPath:\"" + path.substr(1) + "\"}", "", path.substr(1));
		if(pth.includes("#")) {
			pth = pth.substr(0, pth.indexOf("#"));
		}
		if(pth.includes("?")) {
			pth = pth.substr(0, pth.indexOf("?"));
		}
		if (routes[pth]) {
			load("/pages/" + routes[pth], function (c) {
				if (!defaultElement) defaultElement = document.body;
				defaultElement.innerHTML = c.content;
				onPageLoaded(c);
				addLinkHooks();
				if (checker == null) {
					checker = setInterval(function () {
						var curPth = getPath(location.toString());
						if (curPth != path) {
							loadPage(curPth, true);
						}
					}, 100);
				}
			}, function (e) {
				var obj = {};
				obj.status = e.status;
				let curUrl = e.responseURL;
				if (curUrl.indexOf("/pages/") > 0) {
					let secure = curUrl.startsWith("https:");
					let path = curUrl.substr(curUrl.indexOf("/pages/") + 7);
					let dom = getDomain(curUrl)
					if (secure) {
						curUrl = "https://";
					} else {
						curUrl = "http://";
					}
					curUrl += dom + "/" + path;
				}
				obj.url = curUrl;
				obj.content = e.responseText;
				onPageLoadError(obj);
			});
		} else {
			load("/pages/" + routes["404"], function (c) {
				if (!defaultElement) defaultElement = document.body;
				defaultElement.innerHTML = c.content;
				onPageLoaded(c);
				addLinkHooks();
				if (checker == null) {
					checker = setInterval(function () {
						var curPth = getPath(location.toString());
						if (curPth != path) {
							loadPage(curPth, true);
						}
					}, 100);
				}
			}, function (e) {
				var obj = {};
				obj.status = e.status;
				let curUrl = e.responseURL;
				if (curUrl.indexOf("/pages/") > 0) {
					let secure = curUrl.startsWith("https:");
					let path = curUrl.substr(curUrl.indexOf("/pages/") + 7);
					let dom = getDomain(curUrl)
					if (secure) {
						curUrl = "https://";
					} else {
						curUrl = "http://";
					}
					curUrl += dom + "/" + path;
				}
				obj.url = curUrl;
				obj.content = e.responseText;
				onPageLoadError(obj);
			});
		}
	}
}
load("/routes.ini", function (c) {
	var lines = [];
	if (c.content.includes("\n")) {
		lines = c.content.split("\n");
	} else {
		lines.push(c.content);
	}
	for (var i = 0; i < lines.length; i++) {
		if (lines[i].includes(">")) {
			routes[lines[i].split(">")[0].trim()] = lines[i].split(">")[1].trim();
		}
	}
	loadPage(path);
}, function (e) {
	document.write("Failed to load routes, got status code " + e.status);
});
document.onreadystatechange = function () {
	var observer = new MutationObserver(function (mutations) {
		mutations.forEach(function (mutation) {
			addLinkHooks();
		});
	});
	var observerConfig = {
		attributes: true,
		childList: true,
		characterData: true
	};
	var targetNode = document.body;
	observer.observe(targetNode, observerConfig);
	addLinkHooks();
};
