const mobileNavigationOverlayElement = document.getElementById('mobile-navigation-overlay');
const mobileNavAnchorElements = mobileNavigationOverlayElement.getElementsByTagName('a');

function toggleMobileNavigation() {
    if(mobileNavigationOverlayElement.classList.contains('visible')) {
        mobileNavigationOverlayElement.classList.remove('visible');
    } else {
        mobileNavigationOverlayElement.classList.add('visible');
    }
}


const hamburgerElement = document.getElementById('hamburger');
const gElements = hamburgerElement.getElementsByTagName('g');

let isAnimating = false;

function runAnimations() {
    for(const gElement of gElements) {
        gElement.style.animationPlayState = 'running';
    }
}
function pauseAnimations() {
    for(const gElement of gElements) {
        gElement.style.animationPlayState = 'paused';
    }
}

hamburgerElement.addEventListener('click', event => {
    if(!isAnimating) {
        runAnimations();
        toggleMobileNavigation();
        isAnimating = true;
    }
});

gElements[0].addEventListener('animationiteration', event => {
    pauseAnimations();
    isAnimating = false;
});

for(const anchorElement of mobileNavAnchorElements) {
    anchorElement.addEventListener('click', event => {
        toggleMobileNavigation();
        runAnimations();
    });
}