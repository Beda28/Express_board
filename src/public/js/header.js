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
                return response.json();
            } else if (response.status === 200) {
                const a1 = document.createElement("a")
                const a2 = document.createElement("a")

                a1.textContent = "로그인"
                a2.textContent = "회원가입"
                a1.href = "/login.html"
                a2.href = "/register.html"

                document.querySelector(".login").appendChild(a1)
                document.querySelector(".login").appendChild(a2)

                return Promise.reject()
            }
        })
        .then(name => {
            const a1 = document.createElement("a")
            const a2 = document.createElement("a")

            a1.textContent = name.username
            a2.textContent = "로그아웃"
            a2.addEventListener("click", () => {
                fetch(`http://${loc.ptr}:3000/logout`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => {
                        if (response.status === 200) {
                            alert("로그아웃 성공!")
                            window.location.href = "index.html"
                        }
                        else if (response.status === 201) {
                            alert("로그인이 되어있지 않습니다!")
                        }
                    })
            })

            document.querySelector(".login").appendChild(a1)
            document.querySelector(".login").appendChild(a2)
        })
        .catch(error => {})
})