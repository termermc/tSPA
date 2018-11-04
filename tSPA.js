function getDomain(url) {
    return url.replace("http://", "").replace("https://", "").split("/")[0];
}
function getPath(url) {
    var pth = url.replace("://", "");
    return pth.substr(pth.indexOf("/"));
}

var defaultElement = null;
var routes = {};
var domain = getDomain(location.toString());
var path = getPath(location.toString());

var checker = null;

// Loads a remote resource
// Usage
// String url - the url to load
// Function ok(content) - the function that is called when the request is successful
// (Optional) Function error(event) - the function that is called if an error occurs
// (Optional) String method - the request method, defaults to "GET"
function load(url, ok, error, method) {
    var len = 0;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.status == 200) {
            if(this.responseText.length != len) {
                ok(this.responseText);
                len = this.responseText.length;
            }
        } else if(this.status > 0) {
            if(error != undefined) {
                error(this);
            }
        }
    };
    
    var mthd = "GET";
    if(method != undefined) {
        mthd = method;
    }
    xhttp.open("GET", url, true);
    xhttp.send();
}


// Link hook event handler
function linkHook(e) {
    if(getDomain(e.target.href)==domain) {
        e.preventDefault();
        var loc = e.target.href.replace("://", "");
        loc = loc.substr(loc.indexOf("/"));
        
        loadPage(loc);
    }
}

// Applies link hooks
function addLinkHooks() {
    var links = document.getElementsByTagName("a");
    for(var i = 0; i < links.length; i++) {
        links[i].onclick = linkHook;
    }
}



// Apply link hooks
addLinkHooks();

// Loads the specified page
function loadPage(pth, noState, element) {
	var elem = element;
	if(!element) {
		elem = defaultElement;
	}
	
    path = pth;
    if(!noState) window.history.pushState("{urlPath:\""+path.substr(1)+"\"}", "", path.substr(1));
    
    if(routes[pth]) {
        load("/pages/"+routes[pth], function(c) {
			if(!defaultElement) defaultElement=document.body;
            defaultElement.innerHTML = c;
            addLinkHooks();
            if(checker==null) {
                checker = setInterval(function() {
                    var curPth = getPath(location.toString());
                    if(curPth != path) {
                        loadPage(curPth, true);
                    }
                }, 100);
            }
        }, function(e) console.log(e));
    } else {
        load("/pages/"+routes["404"], function(c) {
			if(!defaultElement) defaultElement=document.body;
            defaultElement.innerHTML = c;
            addLinkHooks();
            if(checker==null) {
                checker = setInterval(function() {
                    var curPth = getPath(location.toString());
                    if(curPth != path) {
                        loadPage(curPth, true);
                    }
                }, 100);
            }
        }, function(e) console.log(e));
    }
}

// Load routes
load("/routes.ini", function(c) {
    var lines = [];
    if(c.includes("\n")) {
        lines = c.split("\n");
    } else {
        lines.push(c);
    }
    
    for(var i = 0; i < lines.length; i++) {
        if(lines[i].includes(">")) {
            routes[lines[i].split(">")[0].trim()] = lines[i].split(">")[1].trim();
        }
    }
    
    // Load page for current path
    loadPage(path);
}, function(e) {
    document.write("Failed to load routes, got status code "+e.status);
});

document.onreadystatechange = function() {
    // Apply hooks after DOM is changed
    var observer = new MutationObserver(function(mutations) {
    	mutations.forEach(function(mutation) {
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
};
