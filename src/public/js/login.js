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
    .then(response=>{
        if (response.status === 200){
            alert("로그인 성공");
            window.location.href = "index.html";
        }else if (response.status === 201){
            alert("로그인 실패! 아이디 또는 비밀번호를 확인해주세요.")
        }else if (response.status === 404){
            alert("서버에 오류가 발생했습니다! 잠시 후 다시 시도해주세요")
        }
    })
})