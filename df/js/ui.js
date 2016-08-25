

/*
 * the posts
 */ 

json = {};
app = {
	page:'single',
	postId:0,
	userId:007,
	single: $('.single'),
	spinner: $('.spinner'),
    hasRequestPending: false,
    isLoaded: false,
    subscription: null,
    lastTimeChecked: new Date()
};

addPostToList = function(post){
	var newPost = $('.postTemplate').cloneNode(true);
	newPost.classList.remove('postTemplate')
	$('.date',newPost).innerHTML = timeAgo(json[post].date);
	$('.author',newPost).innerHTML = json[post].author;
	$('.content',newPost).innerHTML = json[post].content;
	$('.number',newPost).innerHTML = json[post].commentCount;
	$('.post',newPost).setAttribute('meta-id',post)
	$('.posts').appendChild(newPost)
	// $('.posts').insertBefore(newPost, $('.posts').firstChild);
}

postTimestamp = function(postId, newTime){
	if (newTime){
		json[postId].date = newTime
	}
	var theTime = timeAgo(json[postId].date)
	$('.date',app.single).innerHTML = theTime;
	$('.post[meta-id="'+ postId +'"] .date').innerHTML = theTime;
}

resetCarousel = function(){
	//horizontal pane scroller
	var outer = new HammerCarousel($('ul.posts'), Hammer.DIRECTION_HORIZONTAL);

	forEach($all('.posts li'), function (index, value) {
		// console.log(index, value); // passes index + value back!
		// value.onclick = function(){
		// 	openSingle($('.post',this).getAttribute('meta-id'))
		// }
		new Hammer(value).on('tap', function(ev) {
			openSingle(ev)
		});
	});
}


// Open single post
openSingle = function(ev){
	$('.leftIcon').classList.add('inner')
	app.single.classList.add('show');

	// Write data
	postId = ev.target.getAttribute('meta-id')
	app.postId = postId
	app.single.setAttribute('meta-id',app.postId)
	$('.author',app.single).innerHTML = json[postId].author;
	// $('.date',app.single).innerHTML = timeAgo(json[postId].date);
	postTimestamp(postId)
	$('.date',app.single).innerHTML = timeAgo(json[postId].date);
	$('.content',app.single).innerHTML = json[postId].content;
	$('.numberOfComments .number',app.single).innerHTML = json[postId].commentCount;
	resetCommentBox()
	for (commentId in json[postId].comments){
		// console.log(commentId)
		// console.log(json[postId].comments[commentId])
		// console.log(' ')
		thisComment = json[postId].comments[commentId];
		addCommentToPost(thisComment)
	}
	$('.postContainer').scrollTop = 0
}

addCommentToPost = function(thisComment){
	// console.log(thisComment)
	var newCommnet = $('.commentTemplate').cloneNode(true),
	commentParent  = $('.single .comments');
	newCommnet.classList.remove('commentTemplate')
	$('.author',newCommnet).innerHTML = thisComment.author;
	$('.date',newCommnet).innerHTML = timeAgo(thisComment.date);
	$('.content',newCommnet).innerHTML = thisComment.content;
	commentParent.appendChild(newCommnet);
}

resetCommentBox = function(){
	$('.newComment').innerHTML = 'Respond';
	$('.makeComment').classList.remove('active')
}

$('.newComment').onfocus = function(){
	if (this.innerHTML == 'Respond')
		this.innerHTML = ''
	$('.makeComment').classList.add('active')
}

$('.newComment').onblur = function(){
	if (this.innerHTML == '')
			resetCommentBox()

	// TODO
	// * write unsaved comment to json
	// * recall when load proper post
	// * store in local cache to be available after session?
}

$('.sendComment').onclick = function(){
	comment = $('.newComment').innerHTML
	resetCommentBox()
	newId = Math.round(Math.random() * 9999999)

	var newPostTime = new Date()
	
	postNotification(comment,app.userId)
	json[app.postId].comments[newId] = {
		'author':app.userId,
		'date': newPostTime,
		'content':comment
	}

	var newCount = Object.keys(json[app.postId].comments).length
	$('.single .numberOfComments .number').innerHTML = newCount
	$('.post[meta-id="'+ postId +'"] .numberOfComments .number').innerHTML = newCount

	postTimestamp(postId, newPostTime)
	console.log('postId:'+postId)

	addCommentToPost(json[app.postId].comments[newId])
	setTimeout(function(){
		$('.postContainer').scrollTop = $('.postContainer').scrollHeight
	},10)
}


// Close single post
closeSingle = function(){
	$('.newPost').classList.remove('show');
	$('.leftIcon').classList.remove('inner')

	app.single.classList.remove('show');
	$('.author',app.single).innerHTML = '';
	$('.date',app.single).innerHTML = '';
	$('.content',app.single).innerHTML = 'empty';
	$('.comments',app.single).innerHTML = '';
}

$('.backArrow').onclick = closeSingle




/*
 * New post / Fab
 */ 
$('.fab').onclick = function(){
	newPost()
}

newPost = function(){
	// notify('Creating a new post does nothing yet');
	$('.newPost').classList.add('show')
	$('.leftIcon').classList.add('inner')

	setTimeout(function(){
		$('.newPost textarea').focus();
	},10)
}

$('.sendPost').onclick = function(){
	// TODO
	// * Add to json
	// * Add to page
}



/*
 * Menu
 */
// $('.burger').onclick = function(){
// 	showMenu()
// }

// showMenu = function(){
// 	notify('No menu, it is to come');
// }

// closeMenu = function(){
// 	//
// }



/*
 * Dev mode
 */
$('.refresh').onclick = function(){
	location.reload()
}


/*
 * And finally... Load the ajax; populate the page
 */
loadPostList = function(){
	fetch('posts.json', {
		method: 'get'
	}).then(function(response) { 
		return response.json();
	}).then(function(j) {
		// console.log(j);
		json = j;
		app.isLoading = false
		$('body').classList.remove('loading')
		for (post in json){
			addPostToList(post)
		}
		resetCarousel()
	});
}
loadPostList()









var reg;
var sub;
var isSubscribed = false;
var subscribeButton = document.querySelector('.notificationSwitch');
var endpoint = document.querySelector('.endpoint');

if ('serviceWorker' in navigator) {
	console.log('Service Worker is supported');
	navigator.serviceWorker.register('sw.js').then(function() {
		return navigator.serviceWorker.ready;
	}).then(function(serviceWorkerRegistration) {
		reg = serviceWorkerRegistration;
		subscribeButton.disabled = false;
		console.log('Service Worker is ready :^)', reg);
		checkSubsciption();
	}).catch(function(error) {
		console.log('Service Worker Error :^(', error);
	});
}



function checkSubsciption(){
	reg.pushManager.getSubscription().then(function(pushSubscription) {
    
	    if (pushSubscription == null){
			subscriptionInUI('off')
		} else {
			subscriptionInUI('on',pushSubscription)
		}
	});
}

subscriptionInUI = function(state,subscription){
	if(state == 'on'){
		sub = subscription
	    subscribeButton.textContent = 'Unsubscribe';
	    isSubscribed = true;
		thisSubscripton = sub.endpoint;
		thisSubscripton = thisSubscripton.split("/")
		app.subscription = thisSubscripton[thisSubscripton.length-1]
		console.log('Subscribed! Endpoint:', sub.endpoint);
		// $('body').innerHTML = sub.endpoint
	} else if(state == 'off'){
	    subscribeButton.textContent = 'Subscribe';
	    isSubscribed = false;
	    console.log('Unsubscribed!');
	}
}

subscribeButton.addEventListener('click', function() {
	if (isSubscribed) {
		unsubscribe();
	} else {
		subscribe();
	}
});

function subscribe() {
	reg.pushManager.subscribe({userVisibleOnly: true}).
	then(function(pushSubscription) {
		subscriptionInUI('on',pushSubscription)
	});
}

function unsubscribe() {
	sub.unsubscribe().then(function(event) {
		subscriptionInUI('off')
	}).catch(function(error) {
		console.log('Error unsubscribing', error);
	});
}







postNotification = function(message,author){
	$('.originalPost .content').innerHTML = 'Loading... ' + JSON.stringify({
			to: app.subscription,
			title: message,
			text: author
		})
	fetch('http://www.lundcreative.com/push.php', {
		method: 'post',
		mode: 'cors',
		body: JSON.stringify({
			to: app.subscription,
			title: message,
			text: author
		})
	}).then(function(response) {
		return response.text();
	}).then(function(text) { 
		// <!DOCTYPE ....
		$('.originalPost .content').innerHTML = text
		console.log('Post response: '+text); 
	}).catch(function(err) {
		$('.originalPost .content').innerHTML = err
	});
}
