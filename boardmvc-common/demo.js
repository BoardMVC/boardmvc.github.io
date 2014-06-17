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

var route = function(path, cb){
    document.body.addEventListener("click", function(e){
        var target = e.target;
        while( target.parentNode ) {
            if (target.tagName === "A" && target.pathname.indexOf(path) !== -1) {
                e.preventDefault();
                cb(target.pathname.split("/").filter(Boolean));
            }

            target = target.parentNode;
        } 
    });
}

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

    var post = items.filter(function(x){
        return x.id === id;
    })[0];

    switchView("item");
    var el = qs(".page > .item");
    el.innerHTML = "";
    el.appendChild(makeItemNode(post));
});

var listing = qs(".page > .listing");
for (var i=0; i<items.length; i++) {
    items[i].votes = {
        score: Math.floor(Math.random()*100 - 20)
    };

    items[i].id = Math.floor(Math.random()*1e5) + 1e4 - 1;

    for (var j=0; j<items[i].comments.length; j++) {
        items[i].comments[j].id = Math.floor(Math.random()*1e9) + 1e8 - 1;
        items[i].comments.forEach(function(comment){
            comment.text = comment.text.replace(/</g, "&lt;")
        })
    }
}


items.sort(function(a, b){
    return b.votes.score - a.votes.score;
});

for (var i=0; i<items.length; i++) {
    listing.appendChild(makeSummaryNode(items[i]));
}

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
    p.author = params.comments[0].author;
    el.innerHTML = insert(_summaryTemplate, p);
    return el;
}

function randomAuthor(){
    var authors = "john|hank|steve|bob|nancy|jane|testuser".split("|");
    return authors[Math.floor(Math.random() * authors.length)];
}

function makeRandomItem(){
    var randomInt = function(min, max){ return Math.floor(Math.random() * (max - min)) + min; }
    var item = {
        votes:  {
            up: randomInt(0, 50),
            down: randomInt(0, 20),
        },
        link: "http://google.com",
        id: Math.floor(Math.random() * 1e5) + 1000,
        author: randomAuthor(),
        comments: makeRandomComment(0).replies
    };

    item.votes.score = item.votes.up - item.votes.down;
    console.log(item)
    return item;
}

function makeRandomComment(depth) {
    depth |= 0;
    var comment = {
        text: "This is a comment",
        author: randomAuthor(),
        replies: []
    };

    if (depth <= 4) {
        var i = Math.floor(Math.random() * 10 - depth * 1.5);
        if (i < 0) {
            i = 0;
        }

        for (; i>0; i--) {
            comment.replies.push(makeRandomComment(depth + 1));
        }
    }

    return comment;
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
