let token;
const rootURL = 'https://photo-app-secured.herokuapp.com';


const username = "webdev";
const password = "password";


async function getAccessToken(rootURL, username, password) {
    const postData = {
        "username": username,
        "password": password
    };
    const endpoint = `${rootURL}/api/token`;
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
    });
    const data = await response.json();
    return data.access_token;
}


const showUser = async () => {
    const endpoint = `${rootURL}/api/profile`;
    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    });
    const data = await response.json();
    console.log('Profile:', data);
    document.querySelector('.user').insertAdjacentHTML('beforeend',
        `<div>
    <img src="${data.image_url}">
    <h2>${data.username}</h2>
    </div>`)
}

const showSuggestions = async (token) => {
    const endpoint = `${rootURL}/api/suggestions/`;
    const response = await fetch(endpoint, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    const data = await response.json();
    console.log('Suggestions: ', data);
    const htmlChunk = data.map(suggestionToHtml).join('')
    document.querySelector('.suggestions').innerHTML = htmlChunk;
}

const suggestionToHtml = (suggestion) => {
    return `
    <section id="suggestion_${suggestion.id}" class="suggestion">
    <img src="${suggestion.image_url}" class="pic" alt="${suggestion.username}">
        <div>
            <p>${suggestion.username}</p>
            <p>suggested for you</p>
            </div>
            <div>
                ${getSuggestions(suggestion)}
            </div>
    </section>`
}

const showStories = async () => {
    const endpoint = `${rootURL}/api/stories`;
    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    const data = await response.json();
    console.log(data);
    const htmlString = data.map(storyToHtml).join('');
    document.querySelector('.stories').innerHTML = htmlString;
}

const storyToHtml = story => {
    return `<div>
        <img src="${story.user.thumb_url}" class="pic"/>
        <p>${story.user.username}</p>
        </div>
    `
}

const showPosts = async () => {
    const endpoint = `${rootURL}/api/posts`;
    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    const data = await response.json();
    console.log('Posts:', data);

    const arrayOfHTML = data.map(postToHtml);
    const htmlString = arrayOfHTML.join('');
    document.querySelector('.card').innerHTML = htmlString;
}

const getLikeButton = post => {
    if (post.current_user_like_id) {
        return `
        <button class="icon-button" aria-label="Like Button" onclick="unlikePost(${post.current_user_like_id}, ${post.id})" aria-checked="true">
            <i class="fas fa-heart"></i>
        </button>
        `;
    } else {
        return `
        <button class="icon-button" aria-label="Like Button" onclick="likePost(${post.id})" aria-checked="false">
            <i class="far fa-heart"></i>
        </button>
        `;
    }
}

const getBookmarkButton = post => {
    if (post.current_user_bookmark_id) {
        return `
        <button class="icon-button" aria-label="Bookmark Button" onclick="unbookmarkPost(${post.current_user_bookmark_id}, ${post.id})" aria-checked="true">
            <i class="fa-solid fa-bookmark"></i>
        </button>
        `;
    } else {
        return `
        <button class="icon-button" aria-label="Bookmark Button" onclick="createBookmark(${post.id})" aria-checked="false"> 
            <i class="fa-regular fa-bookmark"></i>
        </button>
        `;
    }
}


const getSuggestions = suggestion => {

    if (suggestion.curent_user_follow_id) {
        return `
        <button role="switch" class="link_following" onclick="unFollowAccount(${suggestion.curent_user_follow_id}, ${suggestion.id})" aria-checked="true"
        aria-label="Unfollow ${suggestion.username}">unfollow</button>
    `
    } else {
        return `
        <button role="switch" class="link_following" onclick="followAccount(${suggestion.id})" aria-checked="false"
        aria-label="Follow ${suggestion.username}">follow</button>
    `
    }
}

const postToHtml = post => {
    const numComments = post.comments.length;
    if (numComments == 0) {
        showComments = '';
    } else {

        const newestComment = post.comments[numComments - 1];
        if (numComments > 1) {
            showComments = `<section id="view-all-comments" onclick="openModal(${post.id})"> <button class="button">View all ${numComments} comments</button></section>
            <p>
                <strong>${newestComment.user.username}</strong> 
                ${newestComment.text}
            </p>`;
        } else {
            showComments = `<p>
                <strong>${newestComment.user.username}</strong> 
                ${newestComment.text}
            </p>
            `
        }
    }



    return `
<section id="post_${post.id}" class="post">
    <div class="header">
        <h3>${post.user.username}</h3>
            <button class="icon-button"><i class="fas fa-ellipsis-h"></i></button>
    </div>
<img src="${post.image_url}" alt="sigh" width="300" height="300">
<div class="info">
    <div class="buttons">
        <div>
            ${getLikeButton(post)}
            <button class="icon-button"><i class="far fa-comment"></i></button>
            <button class="icon-button"><i class="far fa-paper-plane"></i></button>
        </div>
        <div>
            ${getBookmarkButton(post)}
        </div>
    </div>
    <p class="likes"><strong>${post.likes.length} likes</strong></p>
    <div class="caption">
        <p>
            <strong>${post.user.username}</strong> 
            ${post.caption}
        </p>
    </div>
    <div class="comments">
        ${showComments}
        <p class="timestamp">${post.display_time}</p>
    </div>
</div>
<div class="add-comment">
    <div class="input-holder">
        <i class="far fa-smile"></i>
        <input type="text" id="addComment${post.id}" placeholder="Add a comment...">
    </div>
    <button class="button" onclick="addComment(${post.id})">Post</button>
</div>
</section>
`
}

const openModal = (id) => {
    const modalElement = document.querySelector('.modal-bg');

    console.log('pls work');
    modalElement.classList.remove('hidden');

    modalElement.setAttribute('aria-hidden', 'false');

    document.querySelector('.close').focus();

    modalInfo(id);
}

const closeModal = () => {
    const modalElement = document.querySelector('.modal-bg');

    modalElement.classList.add('hidden');
    modalElement.setAttribute('aria-hidden', 'false');
}

const modalInfo = async (id) => {
    const endpoint = `${rootURL}/api/posts/${id}`;
    const response = await fetch(endpoint, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    const data = await response.json();
    console.log('Posts:', data);

    document.querySelector('.modal-body').innerHTML =
        `<img class="fixed" src="${data.image_url}" />
    <section class="the-comments">
        <div class="top">
            <img src="${data.user.image_url}">
            <strong>${data.user.username}</strong>
            <p>
                ${data.caption}
            </p>
            <p class="timestamp">${data.display_time}</p>
        </div>
        <div class="row">
            <strong>${data.user.username}</strong>
            
        </div>
    </section>`;

    document.querySelector(".row").innerHTML = '';
    data.comments.forEach(modalComments);
}

const modalComments = (data) => {
    document.querySelector('.row').insertAdjacentHTML('beforeend',
        `
    <div>
    <p>
        <strong>${data.user.username}</strong> 
        ${data.text}
    </p>
    <p class="timestamp">${data.display_time}</p>
    </div>
    `
    )
}


document.addEventListener('focus', function (event) {

    const modalElement = document.querySelector('.modal-bg');
    console.log('focus');
    if (modalElement.getAttribute('aria-hidden') === 'false' && !modalElement.contains(event.target)) {
        console.log('back to top!');
        event.stopPropagation();
        document.querySelector('.close').focus();
    }
}, true);


const requeryRedraw = async (postID) => {
    const endpoint = `${rootURL}/api/posts/${postID}`;
    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    const data = await response.json();
    console.log(data);
    const htmlString = postToHtml(data);
    targetElementAndReplace(`#post_${postID}`, htmlString);
}


const followRedraw = async (user_id) => {
    const endpoint = `${rootURL}/api/suggestions/`;
    const response = await fetch(endpoint, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    const data = await response.json();
    console.log('Suggestions: ', data);
    const htmlChunk = data.map(suggestionToHtml).join('')
    document.querySelector('.suggestions').innerHTML = htmlChunk;
}

const createBookmark = async (postID) => {
    const endpoint = `${rootURL}/api/bookmarks/`;
    const postData = {
        "post_id": postID
    };

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(postData)
    })
    const data = await response.json();
    console.log(data);
    requeryRedraw(postID);
}

const unbookmarkPost = async (bookmarkId, postID) => {
    const endpoint = `${rootURL}/api/bookmarks/${bookmarkId}`;

    const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    const data = await response.json();
    console.log(data);
    requeryRedraw(postID);
}

const likePost = async (postID) => {
    const endpoint = `${rootURL}/api/posts/likes`;
    const postData = {
        "post_id": postID
    };

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(postData)
    })
    const data = await response.json();
    console.log(data);
    requeryRedraw(postID);
}

const unlikePost = async (likeId, postID) => {
    const endpoint = `${rootURL}/api/posts/likes/${likeId}`;

    const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    const data = await response.json();
    console.log(data);
    requeryRedraw(postID);
}

const addComment = async (postID) => {
    let commenting = document.querySelector(`#addComment${postID}`);
    const endpoint = `${rootURL}/api/comments`;
    const postData = {
        "post_id": postID,
        "text": commenting.value
    };

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(postData)
    })
    const data = await response.json();
    console.log(data);
    requeryRedraw(postID);
}

const followAccount = async (user_id) => {
    const endpoint = `${rootURL}/api/following/`;
    const postData = {
        "user_id": user_id
    };

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(postData)
    })
    const data = await response.json();
    console.log(data);
    console.log('User id: ' + user_id);
    followRedraw(user_id);
}

const unfollowAccount = async (followId, user_id) => {
    const endpoint = `${rootURL}/api/following/${followId}`;

    const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    const data = await response.json();
    console.log(data);
    followRedraw(user_id);
}



const targetElementAndReplace = (selector, newHTML) => {
    const div = document.createElement('div');
    div.innerHTML = newHTML;
    const newEl = div.firstElementChild;
    const oldEl = document.querySelector(selector);
    oldEl.parentElement.replaceChild(newEl, oldEl);
}

const initPage = async () => {
   
    token = await getAccessToken(rootURL, username, password);
    console.log(token);


    showUser(token);
    showSuggestions(token);
    showStories(token);
    showPosts(token);


}



initPage();

