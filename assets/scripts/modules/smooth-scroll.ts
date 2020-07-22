const anchorElements = <HTMLCollectionOf<HTMLAnchorElement>> document.getElementsByClassName('local-smooth-scroll');
if(anchorElements.length > 0) {
    // Check if scrollIntoView is supported
    if(anchorElements[0].scrollIntoView !== undefined) {
        for(const anchorElement of anchorElements) {
            if(anchorElement.href) {
                const hashIndex = anchorElement.href.indexOf('#');
                if(hashIndex !== -1) {
                    anchorElement.addEventListener('click', event => {
                        event.preventDefault();
                        const scrollToElement = document.getElementById(anchorElement.href.slice(hashIndex + 1));
                        if(scrollToElement === undefined) {
                            console.error(`Could not scroll to ${anchorElement.href} as the element does not exist`);
                            return;
                        }
                        scrollToElement.scrollIntoView({ behavior: 'smooth' });
                    });
                    // Stop :focus state from being stuck on element
                    anchorElement.addEventListener('mousedown', event => event.preventDefault());
                }
            }
        }
    }
}