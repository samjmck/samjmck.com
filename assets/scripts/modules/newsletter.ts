const formElement = document.querySelector("form.newsletter");
const formCheckboxElements = formElement.querySelectorAll<HTMLInputElement>(`input[type="checkbox"]`);
const emailElement = <HTMLInputElement> formElement.querySelector("input#email");
const responseElement = formElement.querySelector("p.result");
formElement.addEventListener("submit", async event => {
    event.preventDefault();
    const email = emailElement.value;
    const groups = [];
    formCheckboxElements.forEach(checkboxElement => {
        groups.push(checkboxElement.value);
    });
    const response = await fetch("/newsletter", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            groups,
        }),
    });
    if(response.status === 200 || response.status === 201) {
        responseElement.innerHTML = "Thanks for subscribing, please check your inbox for a confirmation email.";
    } else {
        console.error(`Could not subscribe to newsletter: ${response.status} ${await response.text()}`)
        responseElement.innerHTML = "Could not subscribe";
    }
});
