const formElement = document.querySelector("form.newsletter");
const formCheckboxElements = formElement.querySelectorAll<HTMLInputElement>(`input[type="checkbox"]`);
const emailElement = <HTMLInputElement> formElement.querySelector("input#email");
const responseElement = formElement.querySelector("p.result");

let clicked = false;

formElement.addEventListener("submit", async event => {
    event.preventDefault();
    if(clicked) {
        return;
    }
    clicked = true;

    const email = emailElement.value;
    const groupIds: number[] = [];
    formCheckboxElements.forEach(checkboxElement => {
        if(checkboxElement.checked) {
            groupIds.push(checkboxElement.value);
        }
    });
    const response = await fetch("/newsletter", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            group_ids: groupIds,
        }),
    });
    if(response.status === 200 || response.status === 201) {
        responseElement.innerHTML = "Thanks for subscribing, please check your inbox for a confirmation email.";
    } else {
        console.error(`Could not subscribe to newsletter: ${response.status} ${await response.text()}`)
        responseElement.innerHTML = "Could not subscribe";
    }
});
