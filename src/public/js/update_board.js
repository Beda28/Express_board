import loc from "./config.js";

window.addEventListener("DOMContentLoaded", () => {
    let url = new URL(window.location.href)
    let urlParams = url.searchParams
    let id = urlParams.get("uuid")

    fetch(`http://${loc.ptr}:3000/getboard`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            uuid: id
        })
    })
        .then(response => {
            if (response.status === 200) {
                return response.json()
            }
        })
        .then(data => {
            document.querySelector(".title > input").value = data.board[0].title
            document.querySelector(".content > textarea").textContent = data.board[0].content
            if (data.file.length > 0)document.querySelector(".file").textContent = data.file[0].filename
        })
})

// 파일 가져오는 기능까지는 좋으나, 파일을 교체하는 파트에 대한 로직은 조금 더 생각해봐야 할듯
// 이미 올린 파일을 삭제시켜서 파일 있는 게시물에서 파일 없는 게시물로 변환시키는것도 좋을것 같다

document.querySelector("button").addEventListener("click", () => {
    const ti = document.querySelector("input").value
    const co = document.querySelector("textarea").value

    if (ti.trim().length == 0 || co.trim().length == 0) return alert("제목과 내용에 공백은 입력할 수 없습니다.")

    let url = new URL(window.location.href)
    let urlParams = url.searchParams
    let id = urlParams.get("uuid")

    fetch(`http://${loc.ptr}:3000/updateboard`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: ti,
            content: co,
            uuid: id
        })
    })
        .then(response => {
            if (response.status === 404){
                return alert("Error : 서버 오류")
            }
            else if (response.status === 200) {
                alert("수정 완료")
                window.location.href = "board.html"
            }
        })
})

// 업로드된 파일이 수정되었다면, 수정안으로 저장시키는 과정이 필요
// 파일을 같이 보내는게 좋을듯
// 오히려 파일 지우는 로직을 함수화해서 딜리트보드와 업데이트 보드에 같은 로직을 쓰는것도 나쁘지 않다고 생각.

// 파일 업로드 된다고 하면
// 아래거 추가해서 교체 적용이 되도록 변경할것

// document.getElementById('fileInput').addEventListener('change', (event) => {
//     if (event.target.files.length > 0) document.querySelector(".file").textContent = `선택된 파일 : ${event.target.files[0].name}`;
// });