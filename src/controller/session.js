const db = require("../config/db")
const crypto = require('crypto');

const hash = (value) => {
    return crypto.createHash('sha256').update(value).digest('hex');
}

exports.login = (req, res) => {
    const { username, password } = req.body;

    if (!username.trim() || !password.trim()) return res.status(400).json({ message : "공백은 입력할할 수 없습니다."})
    if (username.includes(" ") || password.includes(" ")) return res.status(400).json({ message : "공백은 입력할 수 없습니다."})
    if (!/^[A-Za-z0-9_]+$/.test(username)) return res.status(400).json({ message : "id에는 영문자, 숫자, _만 입력할 수 있습니다."})
    if (username.length > 10 || password.length > 255) return res.status(400).json({message : "제한 길이를 초과할 수 없습니다."})

    db.query("SELECT * FROM user where id = ? and password = ?;", [username, hash(password)], (err, result) => {
        if (err) return res.status(500).json({message : "서버 오류, 잠시 후 다시 시도해주세요 !"})
        if (result && result.length > 0){
            req.session.user = {username};
            return res.status(200).json({message : "로그인 성공"})
        }
        else return res.status(400).json({message : "로그인 실패, 아이디 또는 비밀번호를 확인해주세요 !"})
    })
}

exports.register = (req, res) => {
    const { username, password } = req.body;
    
    if (!username.trim() || !password.trim()) return res.status(400).json({ message : "공백은 입력할할 수 없습니다."})
    if (username.includes(" ") || password.includes(" ")) return res.status(400).json({ message : "공백은 입력할 수 없습니다."})
    if (!/^[A-Za-z0-9_]+$/.test(username)) return res.status(400).json({ message : "id에는 영문자, 숫자, _만 입력할 수 있습니다."})
    if (username.length > 10 || password.length > 255) return res.status(400).json({message : "제한 길이를 초과할 수 없습니다."})
    if (password.length < 5) return res.status(400).json({message : "비밀번호는 5글자 이상이어야 합니다."})

    db.query("SELECT * FROM user where id = ?;", username, (err, result) => {
        if (err) return res.status(500).json({message : "서버 오류, 잠시 후 다시 시도해주세요!"})
        if (result && result.length > 0) return res.status(201).json({message : "이미 존재하는 ID 입니다."})
        else{
            db.query("INSERT INTO user (id, password) VALUES (?, ?)", [username, hash(password)], (e, result) => {
                if (e) return res.status(500).json({message : "서버 오류, 잠시 후 다시 시도해주세요!"})
                    return res.status(200).json({message : "회원가입 성공"})
            })
        }
    })
}

exports.logout = (req, res) => {
    if (req.session.user){
        req.session.destroy()
        return res.status(200).json()
    }
    else{
        return res.status(201).json()
    }
}
