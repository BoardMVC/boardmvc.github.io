require! request

output = []

get = (url, cb) ->
    request.get url, (err, data) -> 
        if typeof data.body is 'object'
            cb data.body
        else 
            cb JSON.parse data.body

data <- get 'https://gdata.youtube.com/feeds/api/videos?q=javascript&orderby=viewCount&start-index=1&max-results=50&alt=json'
entries = data.feed.entry

count = entries.length
finished-one = ->
    count := count - 1
    console.log "Progress: #{count}/#{entries.length} remaining"
    if count <= 0
        console.log 'done'
        json = JSON.stringify(output, null, 2)
        require('fs').writeFileSync(__dirname + '/items.json', json)

entries.forEach (entry) ->
    obj = 
        text: entry.content.$t
        link: entry.link.filter(-> it.rel is 'alternate').0.href.replace('&feature=youtube_gdata', '')

    obj.text = entry.content.$t
    output.push obj
    comments <- get entry.gd$comments.gd$feedLink.href + "?alt=json"
    obj.comments = comments.feed.entry.map (comment) ->
        author: comment.author.0.uri.$t.split('/')[*-1]
        replies: []
        text: comment.content.$t

    console.log obj
    finished-one!
