var items = (function(){
    var req = new XMLHttpRequest();
    req.async = false;
    req.open("get", "items.json", false);
    req.send();
    return JSON.parse(req.responseText);
})();

var qs = document.querySelector.bind(document);
var qsa = function(sel){ return [].slice.call(document.querySelectorAll(sel)); };
var _commentTemplate = document.getElementById("comment-template").innerHTML;
var _summaryTemplate = document.getElementById("summary-template").innerHTML;
var onClick = function(el, fn) {
    if (el.length) {
        for (var i=0; i<el.length; i++) onClick(el[i], fn);
        return;
    }

    el.addEventListener('click', function(e){
        e.preventDefault();
        fn(e);
    }, false) };

_routes = [];
var route = function(path, cb){
    _routes.push([path, cb]);
    document.body.addEventListener("click", function(e){
        var target = e.target;
        while( target.parentNode ) {
            if (target.tagName === "A" && target.pathname.indexOf(path) !== -1) {
                e.preventDefault();
                var title = "BoardMVC - " + target.pathname.split('/').filter(Boolean).join(' ');
                history.pushState(null, title, target.pathname);
                gotoCurrentRoute();
                
            }

            target = target.parentNode;
        } 
    });
}

function gotoCurrentRoute(){
    var path = location.pathname;
    for (var i=0; i<_routes.length; i++) {
        if (path.indexOf(_routes[i][0]) !== -1) {
            _routes[i][1](path.split("/").filter(Boolean));
            return;
        }
    }
    // TODO 404 page
    alert(404);
}
window.addEventListener("popstate", gotoCurrentRoute, false);

// calculate scores
var _id = 1000000, itemMap = {};
items.forEach(function setScore(item){
    item.score = item.ups - item.downs;
    item.id = ++_id;
    itemMap[_id] = item;
    var subcomments = item.comments || item.replies || [];
    subcomments.forEach(setScore);
});

onClick(qs('.not-logged-in .log-in'), function(){
    modal("log-in-modal");
});

onClick(qs('.not-logged-in .sign-up'), function(){
    modal("sign-up-modal");
});

onClick(qs('.logged-in .log-out'), function(){
    setLoggedIn(false);
});

onClick(qsa('a.profile'), function(){
    switchView("profile");
});

// modals
onClick(qs(".backdrop"), function(e){
    if (e.target.classList.contains("backdrop")) {
        modal(null);
    }
});

route("/user/", function(parts){
    var username = parts[1];
    switchView("profile");
    qs('.page > .profile > h1').textContent = username;
});

route("/c/", function(parts){
    var id = +parts[1];
    var post = itemMap[id];

    switchView("item");
    var el = qs(".page > .item");
    el.innerHTML = "";
    el.appendChild(makeItemNode(post));
});

route("/", function(){
    var listing = qs(".page > .listing");

    for (var i=0; i<items.length; i++) {
        listing.appendChild(makeSummaryNode(items[i]));
    }
});
onClick(qs(".log-in-modal button[type=submit]"), function(){
    setLoggedIn(true);
    modal(null);
});

function switchView(name){
    qsa('body > .page > div').forEach(function(el){
        if(el.classList.contains(name)) {
            el.style.display = '';
        }
        else {
            el.style.display = 'none';
        }
    });
}

function setLoggedIn(isLoggedIn) {
    qs(".not-logged-in").style.display = isLoggedIn ? "none" : "block";
    qs(".logged-in").style.display = isLoggedIn ? "block" : "none";
}

// call with null to hide all modals
function modal(name){
    qsa(".backdrop > *").forEach(function(el){
        if(el.classList.contains(name)) {
            el.style.display = 'block';
            setTimeout(function(){
                el.querySelector("input:first-of-type").focus();
            }, 0);
        }
        else {
            el.style.display = 'none';
        }
    });

    qs(".backdrop").style.display = name ? "" : "none";
}

function makeCommentHTML(comment) {
    if (comment.replies.length) {
        var comments = "<div class='comments'>" 
                      + comment.replies.map(makeCommentHTML).join("\n") 
                      + "</div>";
    }
    else {
        var comments = "";
    }

    var params = Object.create(comment);
    params.repliesHTML = comments;
    return insert(_commentTemplate, params);
}

function makeItemNode(params){
    var el = document.createElement("div");
    var summary = insert(_summaryTemplate, params);
    el.innerHTML = summary + params.comments.map(makeCommentHTML).join("\n");
    return el;
}

function makeSummaryNode(params){
    var el = document.createElement("div");
    var p = Object.create(params);
    el.innerHTML = insert(_summaryTemplate, p);
    return el;
}

function randomAuthor(){
    var authors = "john|hank|steve|bob|nancy|jane|testuser".split("|");
    return authors[Math.floor(Math.random() * authors.length)];
}

function insert(template, mapping) {
    // if mapping is left out, allow partial application
    if (!mapping) {
        return insert.bind(null, template)
    }

    var has = Object.prototype.hasOwnProperty;

    // replace all upper case parts of the template
    // with the values from mapping
    return template.replace(/\{([A-Za-z0-9.]+)\}/g, function(all, match){
        if (typeof extract(mapping, match) !== "undefined"){
            return extract(mapping, match);
        }
        else {
            return all;
        }
    });
}

function extract(obj, key){
    return key.split('.').reduce(function(p, c) {return p[c]}, obj)
}

gotoCurrentRoute();
