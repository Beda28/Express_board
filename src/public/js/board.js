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
                addlist(data.result[i].uuid, data.result[i].title, data.result[i].maker, data.result[i].formatted_date, data.result[i].view)
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

document.querySelector("button").addEventListener("click", () =>{
    const sa = document.querySelector("input").value.trim();

    if (sa.includes(" ")) return alert("공백은 입력할 수 없습니다.")
    if (/[^A-Za-z0-9가-힣_]/.test(sa)) return alert("특수문자는 입력할 수 없습니다.")

    fetch(`http://${loc.ptr}:3000/search`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            search: sa
        })
    }).then(async (response)=>{
        const data = await response.json()
        if (response.status === 202) return alert("서버 오류 발생")
            
        const list = document.querySelector(".list")
        while(list.firstChild){
            list.firstChild.remove()
        }

        for (let i = 0; i < data.result.length; i++) {
            addlist(data.result[i].uuid, data.result[i].title, data.result[i].maker, data.result[i].formatted_date, data.result[i].view)
        }
    })
})