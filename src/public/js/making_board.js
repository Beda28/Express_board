import loc from "./config.js";

window.addEventListener("DOMContentLoaded", () => {
    fetch(`http://${loc.ptr}:3000/checklogin`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.status === 200) {
                alert("로그인해주세요!")
                return window.location.href = "login.html"
            }
        })
})

document.querySelector("button").addEventListener("click", () => {
    const button = document.querySelector("button")
    if (button.textContent != "작성완료") return
    button.textContent = '로딩중'

    let fi = null
    const ti = document.querySelector("input").value
    const co = document.querySelector("textarea").value

    if (document.querySelector("#fileInput").files.length > 0) { fi = document.querySelector("#fileInput").files[0] }

    fetch(`http://${loc.ptr}:3000/addboard`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: ti,
            content: co
        })
    })
        .then(async (response) => {
            const result = await response.json()
            if (response.status === 404) return alert("Error : 잠시 후 다시 시도해주세요")
            else if (response.status === 405) return alert("공백은 입력할 수 없습니다.")
            else if (response.status === 406) return alert("제한길이를 넘겼습니다.")
            else if (response.status === 201) return alert("중복 작성은 안됩니다.")
            else if (response.status === 200) {
                if (!fi) {
                    alert("작성 완료!")
                    window.location.href = "board.html"
                }
                else {
                    const form = new FormData();
                    form.append("uuid", result.uuid)
                    form.append("file", fi)
                    fetch(`http://${loc.ptr}:3000/upload`, {
                        method: 'POST',
                        body: form
                    }).then(res => {
                        if (res.status === 404) return alert("서버 오류. 파일이 성공적으로 업로드되지 않았습니다!")
                        else if (res.status === 415) return alert("허용되지 않는 확장자입니다.")
                        else if (res.status === 500) return alert("서버 오류")
                        else if (res.status === 200) {
                            alert("작성 완료!")
                            window.location.href = "board.html"
                        }
                    })
                }
            }
        })
        .finally(() => {
            button.textContent = "작성완료"
        })
})


document.getElementById('fileInput').addEventListener('change', (event) => {
    if (event.target.files.length > 0) document.querySelector(".file").textContent = `선택된 파일 : ${event.target.files[0].name}`;
});