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
    let fi = 0
    const ti = document.querySelector("input").value
    const co = document.querySelector("textarea").value

    if (ti.trim().length == 0 || co.trim().length == 0) return alert("제목과 내용에 공백은 입력할 수 없습니다.")

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
        .then(response => {
            if (response.status === 404) alert("Error : 잠시 후 다시 시도해주세요")
            else if (response.status === 200) {
                return response.json()
            }
        })
        .then(data => {
            if (fi == 0) {
                alert("작성 완료!")
                window.location.href = "board.html"
            }
            else{
                const form = new FormData();
                form.append("uuid", data.uuid)
                form.append("file", fi)
                fetch(`http://${loc.ptr}:3000/upload`, {
                    method: 'POST',
                    body: form
                }).then(response => {
                    if (response.status === 404) alert("서버 오류. 파일이 성공적으로 업로드되지 않았습니다!")
                    else if (response.status === 415) alert("허용되지 않는 확장자입니다.")
                    else if (response.status === 200){
                        alert("작성 완료!")
                        window.location.href = "board.html"
                    }
                })
            }
        })
})


document.getElementById('fileInput').addEventListener('change', (event) => {
    if (event.target.files.length > 0) document.querySelector(".file").textContent = `선택된 파일 : ${event.target.files[0].name}`;
});