import loc from "./config.js";

document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault()

    let na = document.querySelector(".name").value
    let pa = document.querySelector(".passwd").value

    fetch(`http://${loc.ptr}:3000/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: na,
            password: pa
        })
    })
    .then(async (response)=>{
        const result = await response.json()

        if (response.status === 200){
            alert(result.message)
            window.location.href = "login.html"
        }
        else{
            alert(result.message)
        }
    })
})