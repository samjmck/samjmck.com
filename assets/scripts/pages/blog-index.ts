import '../modules/mobile-navigation';

interface PostData {
    languageCode: string;
    title: string;
    description: string;
    tags: string[];
    categories: string[];
    date: string;
    publishDate: string;
    lastModifiedDate: string;
    otherLanguages: {
        languageName: string;
        languageCode: string;
        title: string;
        link: string;
    }[];
}

interface Post {
    data: PostData;
    element: HTMLLIElement;
}

const postsElement = document.getElementById('posts');
const posts: Post[] = [];

// Create the post DOM element so it's ready to use when the user starts filtering
function createPostListElement(postData: PostData, languageCode: string): HTMLLIElement {
    const english = 'Dutch version available';
    const dutch = 'Engelse versie beschikbaar';
    const languageInner = languageCode === 'en' ? english : dutch;

    const element = <HTMLLIElement> document.createElement('li');
    element.className = 'post';
    element.innerHTML = `
    <div class="post-header">
        <span class="post-date">${postData.publishDate}</span> ${postData.otherLanguages.length > 0 ? `<span class="language"><a href="${postData.otherLanguages[0].link}" alt="${postData.otherLanguages[0].title}">${languageInner}</a></span>` : ''}
    </div>
    <h2 class="post-title">${postData.title}</h2>
    <p class="description">${postData.description}</p>
    `
    return element;
}

let languageCode = 'all';
let category = 'all';
const tags: string[] = [];

function updatePosts() {
    postsElement.innerHTML = '';
    for(const post of posts) {
        // Language
        let hasLanguage = false;
        if(languageCode === 'all') {
            hasLanguage = true;
        } else if(languageCode === post.data.languageCode) {
            hasLanguage = true;
        } else {
            for(const otherLanguage of post.data.otherLanguages) {
                if(otherLanguage.languageCode === languageCode) {
                    hasLanguage = true;
                }
            }
        }

        // Category
        // If categories is set to "all" or the one of the post's categories is the selected category, set hasCategory to true
        let hasCategory = false;
        if(category === 'all' || post.data.categories.indexOf(category) > -1) {
            hasCategory = true;
        }

        // Tags
        // If post has one of the selected tags, set hasTag to true
        let hasTag = false;
        if(tags.length === 0) {
            hasTag = true;
        } else {
            for(const postTag of post.data.tags) {
                for(const selectedTag of tags) {
                    if(postTag === selectedTag) {
                        hasTag = true;
                        break;
                    }
                }
                if(hasTag) {
                    break;
                }
            }
        }

        if(hasLanguage && hasCategory && hasTag) {
            postsElement.appendChild(post.element);
        }
    }
}

let selectedCategoryElement = document.getElementsByClassName('selected category')[0];
for(const categoryElement of document.getElementsByClassName('category')) {
    categoryElement.addEventListener('click', function() {
        if(this.classList.contains('selected')) {
            return;
        }
        category = this.dataset.category;
        this.classList.add('selected');
        selectedCategoryElement.classList.remove('selected');
        selectedCategoryElement = this;
        updatePosts();
    });
}

// If element is already selected, just return and do nothing
// If element is not selected, remove the selected class from the previously selected element,
// add the selected class to the clicked element and finally update the language with the language
let selectedLanguageElement = document.getElementsByClassName('selected language')[0];
for(const languageElement of document.getElementsByClassName('language')) {
    languageElement.addEventListener('click', function() {
        if(this.classList.contains('selected')) {
            return;
        }
        languageCode = this.dataset.languageCode;
        this.classList.add('selected');
        selectedLanguageElement.classList.remove('selected');
        selectedLanguageElement = this;
        updatePosts();
    });
}

// If already selected, remove the selected class and remove the tag from the filter tags
// If not selected, add the selected class and add the tag to the filter tags
for(const tagElement of document.getElementsByClassName('tag')) {
    tagElement.addEventListener('click', function() {
        if(this.classList.contains('selected')) {
            tags.splice(tags.indexOf(this.dataset.tag), 1);
            this.classList.remove('selected');
        } else {
            tags.push(this.dataset.tag);
            this.classList.add('selected');
        }
        updatePosts();
    });
}

// Prefetch the html of the page when hovering over the link
const prefetchedLinks: string[] = [];
for(const aElement of document.querySelectorAll<HTMLAnchorElement> ('li.post h2.post-title a')) {
    aElement.addEventListener('mouseover', event => {
        if(prefetchedLinks.indexOf(aElement.href) > -1) {
            return;
        }
        const linkElement = <HTMLLinkElement> document.createElement('link');
        linkElement.rel = 'prefetch';
        linkElement.href = aElement.href;
        prefetchedLinks.push(aElement.href);
        document.body.appendChild(linkElement);
    });
}

// Load all the posts data from index.json and then save the data alongside its DOM element
(async () => {
    const languageCode = document.documentElement.lang;
    const response = await fetch('index.json');
    const data = <PostData[]> await response.json();

    for(const postData of data) {
        posts.push({
            data: postData,
            element: createPostListElement(postData, languageCode),
        });
    }
})();

// Mobile filter stuff

function showElement(element: HTMLElement) {
    element.classList.add('showing');
}

function hideElement(element: HTMLElement) {
    element.classList.remove('showing');
}

for(const filterElement of document.getElementsByClassName('filter')) {
    const filterListElement = (<HTMLCollectionOf<HTMLUListElement>> filterElement.getElementsByClassName('filter-list'))[0];
    const showFilterElement = (<HTMLCollectionOf<HTMLSpanElement>> filterElement.getElementsByClassName('show-filter'))[0];
    const hideFilterElement = (<HTMLCollectionOf<HTMLSpanElement>> filterElement.getElementsByClassName('hide-filter'))[0];
    filterElement.getElementsByClassName('filter-title')[0].addEventListener('click', event => {
        if(filterListElement.classList.contains('showing')) {
            showElement(showFilterElement);
            hideElement(hideFilterElement);
            hideElement(filterListElement);
        } else {
            showElement(hideFilterElement);
            hideElement(showFilterElement);
            showElement(filterListElement);
        }
    });
}