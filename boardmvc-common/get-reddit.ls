require! request

output = []

get = (url, cb) ->
    request.get url, (err, data) -> 
        if typeof data.body is 'object'
            cb data.body
        else 
            cb JSON.parse data.body

feed <- get 'http://www.reddit.com/r/javascript.json'
entries = feed.data.children

count = entries.length
finished-one = ->
    count := count - 1
    console.log "Progress: #{count}/#{entries.length} remaining"
    if count <= 0
        console.log 'done'
        json = JSON.stringify(output, null, 2)
        require('fs').writeFileSync(__dirname + '/items.json', json)

entries.map (.data) .forEach (entry) ->
    obj = 
        title: entry.title
        text: entry.selftext
        link: entry.url
        ups: entry.ups
        downs: entry.downs
        author: entry.author

    output.push obj
    comments <- get "http://reddit.com" + entry.permalink + '.json'
    format-comment = ({data}) ->
        author: data.author
        replies: (data?.replies?.data?.children?.map format-comment) or []
        text: data.body
        ups: data.ups
        downs: data.downs

    obj.comments = (comments.1.data.children.map format-comment) or []
    
    unless obj.comments.length
        console.log 'No comments for #{entry.title}'  
    finished-one!
