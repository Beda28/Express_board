import loc from "./config.js";

document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault()

    let name = document.querySelector(".name").value
    let pass = document.querySelector(".passwd").value

    fetch(`http://${loc.ptr}:3000/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: name,
            password: pass
        })
    })
    .then(async(response)=>{
        const result = await response.json();
        
        if (response.status === 200){
            alert(result.message)
            window.location.href = "index.html";
        }
        else{
            alert(result.message)
        }
    })
})