const db = require("../config/db")
const crypto = require('crypto');

const hash = (value) => {
    return crypto.createHash('sha256').update(value).digest('hex');
}

exports.login = (req, res) => {
    const { username, password } = req.body;
    db.query("SELECT * FROM user where id = ? and password = ?;", [username, hash(password)], (err, result) => {
        if (err) res.status(404).json()
        if (result.length > 0){
            req.session.user = {username};
            res.status(200).json()
        }
        else res.status(201).json()
    })
}

exports.register = (req, res) => {
    const { username, password } = req.body;
    db.query("SELECT * FROM user where id = ?;", username, (err, result) => {
        if (err) res.status(404).json()
        if (result.length > 0) res.status(201).json()
        else{
            db.query("INSERT INTO user (id, password) VALUES (?, ?)", [username, hash(password)], (e, result) => {
                if (e) res.status(404).json()
                res.status(200).json()
            })
        }
    })
}

exports.logout = (req, res) => {
    if (req.session.user){
        req.session.destroy()
        res.status(200).json()
    }
    else{
        res.status(201).json()
    }
}
