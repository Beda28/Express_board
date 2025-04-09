import loc from "./config.js";

document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault()

    let na = document.querySelector(".name").value
    let pa = document.querySelector(".passwd").value

    fetch(`http://${loc.ptr}:3000/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: na,
            password: pa
        })
    })
    .then(response=>{
        if (response.status === 200){
            alert("회원가입 성공\n로그인해주세요");
            window.location.href = "login.html";
        }else if (response.status === 201){
            alert("이미 존재하는 ID입니다")
        }else if (response.status === 404){
            alert("서버에 오류가 발생했습니다! 잠시 후 다시 시도해주세요")
        }
    })
})