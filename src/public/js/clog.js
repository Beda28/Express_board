import loc from "./config.js";

window.addEventListener("DOMContentLoaded", () => {
    fetch(`http://${loc.ptr}:3000/checklogin`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.status === 201) {
                alert("로그인되어있습니다!")
                return window.location.href = "index.html"
            }
        })
})