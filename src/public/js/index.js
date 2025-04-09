import loc from "./config.js";

window.addEventListener("DOMContentLoaded", () => {
  fetch(`http://${loc.ptr}:3000/checklogin`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      if (res.status === 201) return res.json();
      else return Promise.reject("not logged in");
    })
    .then((user) => {
      const box = document.getElementById("cta-box");
      const link = document.createElement("a");
      link.href = "/board.html";
      link.textContent = "게시판 바로가기";
      box.appendChild(link);
    })
    .catch(() => {
      const box = document.getElementById("cta-box");
      const link = document.createElement("a");
      link.href = "/register.html";
      link.textContent = "회원가입 후 시작하기";
      box.appendChild(link);
    });
});
