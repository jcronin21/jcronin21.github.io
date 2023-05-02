import {getAccessToken} from './utilities.js';

const rootURL = 'https://photo-app-secured.herokuapp.com';

const showStories = async (token) => {
    const endpoint = `${rootURL}/api/stories`;
    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    const data = await response.json();
    console.log(data);
    const htmlChunk = data.map(storyToHtml).join('');
    document.querySelector('#stories').innerHTML = htmlChunk;
}

const storyToHtml = story => {
    return `<section>
        <img src="${story.user.thumb_url}" />
        <p>${story.user.username}</p>
    </section>
    `
}

const showPosts = async (token) => {
    const endpoint = `${rootURL}/api/posts`;
    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    const data = await response.json();
    console.log('Posts:', data);

    const arrayOfHTML = data.map(postToHTML);
    console.log(arrayOfHTML);
    const htmlString = arrayOfHTML.join('');
    document.querySelector('#posts').innerHTML = htmlString;
}

const commentToHtml = comment => {
    return `<div>
        <p>${comment.user.username}: ${comment.text}</p>
    </div>`;
}


const showModal = async postId => {
    // Retrieve the post data from the API
    const endpoint = `${rootURL}/api/posts/${postId}`;
    const response = await fetch(endpoint);
    const post = await response.json();
    // Generate the HTML for the modal window
    const modalHtml = `
        <div id="modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); z-index: 999;">
            <div style="position: absolute; top: 10px; right: 10px;">
                <button onclick="closeModal()">Close</button>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; height: 100%; padding: 20px;">
                <div style="flex: 1; margin-right: 20px;">
                    <img src="${post.image_url}" alt="Fake image" style="max-width: 100%; max-height: 100%;">
                </div>
                <div style="flex: 1; overflow-y: auto;">
                    <h2>Comments</h2>
                    ${ post.comments.map(commentToHtml).join('') }
                </div>
            </div>
        </div>
    `;
    // Insert the modal HTML into the document
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Close the modal window
const closeModal = () => {
    const modal = document.querySelector('#modal');
    modal.parentElement.removeChild(modal);
}


const showCommentAndButtonIfItMakesSense = post => {
    const hasComments = post.comments.length > 0;
    const lastCommentIndex = post.comments.length - 1;
    if (hasComments) {
        return `<div>
            <button onclick="showModal()">View all ${post.comments.length} comments</button>
            <p>${post.comments[lastCommentIndex].text}</p>
        </div>`;
    } else {
        return '';
    } 
}

const postToHTML = post => {
    const hasComments = post.comments.length > 0;
    const lastCommentIndex = post.comments.length - 1;
    return `
        <section>
            <img src="${post.image_url}" alt="Fake image" />
            <p>${post.caption}</p>
            ${ hasComments ? 
                `<div>
                    <button onclick="showModal(${post.id})">View all ${post.comments.length} comments</button>
                    <p>${post.comments[lastCommentIndex].text}</p>
                </div>` 
                : '' }
        </section>
    `
}
const openModal = (id) => {
    const modalElement = document.querySelector('.modal-bg');

    console.log('pls work');
    // shows the modal:
    modalElement.classList.remove('hidden');

    // accessibility:
    modalElement.setAttribute('aria-hidden', 'false');

    // puts the focus on the "close" button:
    document.querySelector('.close').focus();

    modalInfo(id);
}


const initPage = async () => {
    // first log in (we will build on this after Spring Break):
    const token = await getAccessToken(rootURL, 'webdev', 'password');
    console.log(token);
    // then use the access token provided to access data on the user's behalf
    showStories(token);
    showPosts(token);

    // query for the user's profile
    // query for suggestions
}


// Kicks off the website:
initPage();
