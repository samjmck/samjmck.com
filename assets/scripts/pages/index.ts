import '../modules/smooth-scroll';

const headerElement = document.getElementsByTagName('header')[0]
const observer = new IntersectionObserver(entries => {
    for(const entry of entries) {
        if(!entry.isIntersecting) {
            headerElement.classList.add('show-border');
        } else {
            headerElement.classList.remove('show-border');
        }
    }
}, {
    threshold: 1
});

observer.observe(document.querySelector('section.introduction div.container'));