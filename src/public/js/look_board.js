import loc from "./config.js";

window.addEventListener("DOMContentLoaded", async () => {
    let url = new URL(window.location.href)
    let urlParams = url.searchParams
    let id = urlParams.get("uuid")
    let user = null

    const res = await fetch(`http://${loc.ptr}:3000/checklogin`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })

    if (res.status === 201){
        const result = await res.json()
        user = result.username
    }

    fetch(`http://${loc.ptr}:3000/lookboard`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            uuid: id
        })
    })
        .then(response => {
            if (response.status === 404) {
                alert("Error : 나중에 다시 시도해주세요.")
                return window.location.href = "board.html"
            }
            if (response.status === 200) {
                return response.json()
            }
        })
        .then(data => {
            const content = document.querySelector(".content > textarea")

            document.querySelector(".title > p").textContent = data.board[0].title
            content.textContent = data.board[0].content

            document.querySelector(".maker").textContent = data.board[0].maker
            document.querySelector(".date").textContent = data.board[0].date

            content.style.height = "auto";
            content.style.height = content.scrollHeight + "px";

            if (data.file[0]) {
                document.querySelector(".filename").textContent = data.file[0].filename
                document.querySelector(".file").style.display = 'flex'
            }

            if (user != null) {
                if (user == data.board[0].maker) {
                    document.querySelector(".btns").style.display = "flex"
                    document.querySelector(".add").addEventListener("click", () => {window.location.href = `updateboard.html?uuid=${id}`})
                    document.querySelector(".del").addEventListener("click", () => {
                        fetch(`http://${loc.ptr}:3000/deleteboard`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                uuid: id
                            })
                        })
                            .then(response => {
                                if (response.status === 202) {
                                    alert("사용자가 작성한 글이 아닙니다")
                                }
                                else if (response.status === 200) {
                                    alert("삭제 성공")
                                }
                                window.location.href = "board.html"
                            })
                    })
                }
            }

        })
})

document.querySelector(".file").addEventListener("click", () => {
    let url = new URL(window.location.href)
    let urlParams = url.searchParams
    let id = urlParams.get("uuid")

    window.location.href = `/download/${id}`
})
