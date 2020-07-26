const mobileNavigationOverlayElement = document.getElementById('mobile-navigation-overlay');
const mobileNavAnchorElements = mobileNavigationOverlayElement.getElementsByTagName('a');
const navButtonElement = document.getElementById('nav-button');

let opened = false;
let isTransitioning = false;
function toggleMobileNavigation() {
    isTransitioning = true;
    if(mobileNavigationOverlayElement.classList.contains('visible')) {
        mobileNavigationOverlayElement.classList.remove('visible');
    } else {
        mobileNavigationOverlayElement.classList.add('visible');
    }
    opened = !opened;
}
function switchNavButton() {
    if(navButtonElement.classList.contains('show-cross')) {
        navButtonElement.classList.remove('show-cross');
    } else {
        navButtonElement.classList.add('show-cross');
    }
}
mobileNavigationOverlayElement.addEventListener('transitionend', event => {
    isTransitioning = false;
});


navButtonElement.addEventListener('click', event => {
    if(!isTransitioning) {
        toggleMobileNavigation();
        switchNavButton();
    }
});

for(const anchorElement of mobileNavAnchorElements) {
    anchorElement.addEventListener('click', event => {
        toggleMobileNavigation();
        switchNavButton();
    });
}

window.addEventListener('resize', event => {
    if(window.innerWidth > 850) {
        if(opened) {
            toggleMobileNavigation();
            switchNavButton();
        }
    }
});