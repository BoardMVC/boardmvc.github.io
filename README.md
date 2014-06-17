# BoardMVC

Note: this is a draft.  The rules and requirements will be finalized on July 1st 2014.

You may have seen [TodoMVC](http://todomvc.com/) which shows the same todo list, created with
many different frameworks and libraries.  

It's very helpful, but people often find it lacking in common requirements for a web app.  It doesn't
handle users, persistence, reusable components, modals, AJAX, etc.

TodoMVC helps you quickly weed out the frameworks you don't like, while this allows you to see which 
you do like at medium scale.

BoardMVC is very similar to Reddit, which is a real site used by many people with all of these
requirements.  To focus on the front end, a server is provided for you but you can feel free to modify it
to fit your framework better.

## Rules

You should provide a version readable by JavaScript developers (JavaScript, Typescript, etc.) unless the
library is used over 50% of the time in a certain altjs language.  You may also provide additional versions
in any languages you like.  

This is a great time to show off your build process and tooling.  Use browserify, require.js, webpack, grunt,
gulp, and whatever other tools are common to see in projects using your framework.

HTML mocks and CSS are provided for you to base your application off of.  You may include additional CSS if your framework
applies classes to elements, or it's otherwise unavoidable.

Please document your tooling, extra css, and any bending of the rules in your README.md.

`npm run build` should compile the project.  `npm start` is already configured to run the server on http://localhost:8080.

If something is confusing or wrong, create an issue or fork and send a pull request.  This is the time to change it!

## Parts

There are several main parts of this application:

* the base, which includes the header and footer
    * the header contains the login/logout button and the user's name with
        a link to their [profile][a-profile]
* the board page (home page)
    * lists the 10 most popular items (most votes)
    * has a button at the bottom to load 10 more items
    * items show as a [summary][a-summary]
    * has a button to [post][a-post] a new item
* the [profile page][a-profile]
* the [sign up][a-sign-up] and [sign in][a-sign-in] modal views

### Summary

The summary of an item contains 
 1. the title which links to the [item][a-item] url
 1. a reply button which links to the item page
    * focuses and scrolls to the [comment box][a-comment-box]
 1. the name of the author, which links to their [profile][a-profile]
 1. a [vote up/down button][a-vote]
 
### Vote Button

The vote button is a an up arrow, a down arrow, and its counter

* the counter must be red if < 0 (`class="bad"`)
* the counter must be green if > 50 (`class="good"`)
* the counter must otherwise be black
* the counter number must be formatted like this: 1 10 100 1,000 10,000 1,000,000
* when clicked the item **or** comment must be voted up or down
* if the user has already voted, the corresponding button must show it (`class="active"`)
* if the user has already voted, when clicking corresponding button, `class="active"` must be removed,
 and the up vote must be deleted

### Item Page

The item page contains the same [summary][a-summary] item at the top, and comments below it.

* the comments may be arbitrarily nested
* the comments contain a body of up to 5000 characters
* the comments contain a link to the author's profile
* the comments contain a [vote button][a-vote]
* top level comments should be sorted by votes
* top, second, and third levels display by default, and have a "show more" for forth, fifth, etc. level comments
* every comment at every level contains a reply button
    * when clicked a [form][a-comment-form] appears below the comment

There is also a comment form at the bottom of the page.

### Comment Form

The comment form:

* has a text area where the user can enter input
* the form is bad if less than 10 characters, or greater than 5000 characters
    * only set `class="bad"` when the user stops typing for more than 750ms, i.e. trailing debounce
    * unset `class="bad"` instantly when the form is valid
* there is a submit button which must have `disabled="disabled"` if the form is invalid
* there is a character indicator "X/5,000" with the same comma formatting as above

### Posting

Brings you to a new page

* the user must enter a valid URL to the item you're discussing
* the user may fill out a description (which will be rendered as the first comment)
* this form should behave the same a the [reply form][a-comment-form], except:
    * the description is between 0 and 5,000 characters
    * the url must be provided
    * the button says Post instead of Reply

### Sign up

The signup form simply asks for an username, and password.  It should be in a modal with
a backdrop, centered on the screen.

* validate with an AJAX request that the username is available every 750ms, i.e. trailing throttle
* do the above validation instantly on blur or submit
* assert the username only contains alphanumeric characters, i.e. `/^[A-Za-z0-9]+$/`
* assert the password is between 5 and 32 characters long
* when the user signs up redirect to the home page, and is logged in immediately
    * if the user was brought to the sign up modal due to being [unauthenticated][a-auth], it should instead complete that action

### Sign in

The sign in form is similar to the signup form except

* no AJAX username checking
* if the sign in fails, a button should show up offering a password reset
    * when clicked: `alert("This feature wouldn't add anything, \nso BoardMVC requested it be unimplemented")`
* when it fails, the server will provide `{"message", "some reason"}` which should be shown until the next login attempt starts
* when it succeeds, the user should immediately appear to be logged in and the modal should dismiss without redirecting
* if the user was brought here due to [not being authenticated][a-auth], a link at the button should show "New?  Sign up!" 
    * the sign up dialog should open when clicked, and the sign in should close

### Profile

Users have a profile page.

* shows their combined vote count across
* shows their 25 most recent posts and replies as in the [item page][a-item]
    * these link to the corresponding item
    * they have the inline reply functionality and the [comment form][a-comment-box] for user posts
    

### Authentication 

Several actions imply a user being logged in.  If any of these buttons/links are pressed, instead of the taking
that action, a [sign in][a-sign-in] modal should be shown, and then the action invoked after login has completed.

* clicking [post][a-post]
* clicking [reply][a-comment-box]
* [voting][a-vote]

[a-comment-box]: #comment-form "Comment Form"
[a-summary]: #summary "Summary"
[a-post]: #posting "Posting"
[a-sign-up]: #sign-up "Sign up"
[a-sign-in]: #sign-in "Sign in"
[a-item]: #item-page "Item Page"
[a-vote]: #vote-button "Vote Button"
[a-profile]: #profile "Profile"
[a-auth]: #authentication "Authentication"

