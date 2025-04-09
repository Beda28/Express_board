import loc from "./config.js";

window.addEventListener("DOMContentLoaded", () => {
    fetch(`http://${loc.ptr}:3000/checklist`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.status === 200) {
                return response.json()
            }
            else if (response.status === 202) {
                return alert("서버 오류 발생")
            }
        })
        .then(data => {
            for (let i = 0; i < data.result.length; i++) {
                addlist(data.result[i].uuid, data.result[i].title, data.result[i].maker, data.result[i].date, data.result[i].view)
            }
        })
})

const addlist = (uuid, title, maker, date, vi) => {
    const addiv = document.querySelector(".list")
    const div = document.createElement("div")

    const ti = document.createElement("p")
    const ma = document.createElement("p")
    const view = document.createElement("p")
    const dat = document.createElement("p")

    ti.textContent = title
    ma.textContent = maker
    dat.textContent = date
    view.textContent = vi

    ti.classList.add("titlel")
    ma.classList.add("maker")
    dat.classList.add("date")
    view.classList.add("view")

    div.addEventListener("click", () => {
        window.location.href = `look_board.html?uuid=${uuid}`
    })

    div.appendChild(ti)
    div.appendChild(ma)
    div.appendChild(dat)
    div.appendChild(view)
    addiv.appendChild(div)

    // if (maker != user || user == null){
    //     ddiv.appendChild(ma)
    //     ddiv.appendChild(view)
    //     div.appendChild(ti)
    //     div.appendChild(ddiv)
    //     addiv.appendChild(div)
    // } else if (maker == user) {
    //     const d2 = document.createElement("div")
    //     const d3 = document.createElement("div")
    //     const add = document.createElement("a")
    //     const del = document.createElement("a")

    //     d3.classList.add("btn")
    //     add.textContent = "수정"
    //     del.textContent = "삭제"
    //     add.classList.add("add")
    //     del.classList.add("del")
    //     add.href = `updateboard.html?uuid=${uuid}`

    //     del.addEventListener("click", (e) => {
    //         e.stopPropagation()
    //         const id = uuid;
    //         fetch("http://localhost:3000/deleteboard", {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify({
    //                 uuid: id
    //             })
    //         })
    //             .then(response => {
    //                 if (response.status === 202) {
    //                     alert("사용자가 작성한 글이 아닙니다")
    //                 }
    //                 else if (response.status === 200) {
    //                     alert("삭제 성공")
    //                 }
    //                 window.location.href = "board.html"
    //             })
    //     })

    //     d3.appendChild(add)
    //     d3.appendChild(del)
    //     d2.appendChild(ti)
    //     d2.appendChild(d3)
    //     ddiv.appendChild(ma)
    //     ddiv.appendChild(view)
    //     div.appendChild(d2)
    //     div.appendChild(ddiv)
    //     addiv.appendChild(div)
    // }
}


document.querySelector(".filter > a").addEventListener("click", () => {
    fetch(`http://${loc.ptr}:3000/checklogin`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.status === 201) {
                return window.location.href = "making_board.html"
            } else if (response.status === 200) {
                alert("로그인 후 이용 가능합니다!")
            }
        })
})
