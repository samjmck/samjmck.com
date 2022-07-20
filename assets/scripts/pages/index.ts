import '../modules/smooth-scroll';
import '../modules/mobile-navigation';
import '../modules/newsletter';

const headerElement = document.getElementsByTagName('header')[0]
if("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
        for(const entry of entries) {
            if(entry.isIntersecting) {
                headerElement.classList.add('hide-border');
            } else {
                headerElement.classList.remove('hide-border');
            }
        }
    }, {
        threshold: 1,
    });

    observer.observe(document.querySelector('section.home div.container'));
}
