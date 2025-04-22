const db = require("../config/db")
const fs = require("fs")
const path = require("path");
const { v4: uuidv4 } = require('uuid');

exports.checkboard = (req, res) => {
    db.query("SELECT uuid, title, maker, DATE_FORMAT(date, '%Y-%m-%d') AS formatted_date, view FROM board ORDER BY date DESC;", (err, result) => {
        if (err) {
            res.status(202).json(err)
        } else {
            res.status(200).json({ result })
        }
    })
}

exports.search = (req, res) => {
    db.query("SELECT uuid, title, maker, DATE_FORMAT(date, '%Y-%m-%d') AS formatted_date, view FROM board WHERE title LIKE CONCAT('%', ?, '%') OR maker LIKE CONCAT('%', ?, '%') ORDER BY date DESC;", [req.body.search, req.body.search, req.body.search], (err, result) => {
        if (err) res.status(202).json(err)
        else res.status(200).json({result})
    })
}

exports.addboard = (req, res) => {
    const now = new Date();
    const uuid = uuidv4();

    if (req.body.content.trim().length == 0 || req.body.title.trim().length == 0) return res.status(405).json({message : "공백은 입력할 수 없습니다."})
    else if(req.body.content.trim().length >= 1000 || req.body.title.trim().length >= 20) return res.status(406).json({message : "제한길이를 넘겼습니다."})

    const lastPostTime = req.session.lastPostTime ? new Date(req.session.lastPostTime) : null;
    if (lastPostTime && (now - lastPostTime) / 1000 <= 7) {
        return res.status(201).json();
    }

    req.session.lastPostTime = now;

    db.query("insert into board_content(uuid, content, maker) value (?,?,?);", [uuid, req.body.content, req.session.user.username], (err) => {
        if (err) return res.status(404).json(err)
    })

    db.query("insert into board(uuid, title, maker) value(?, ?, ?);", [uuid, req.body.title, req.session.user.username], (err) => {
        if (err) return res.status(404).json(err)
    })
    res.status(200).json({ uuid: uuid })
}

exports.lookboard = (req, res) => {
    db.query("select b.title, bc.content, b.maker, b.view, DATE_FORMAT(b.date, '%Y-%m-%d') AS date from board b join board_content bc on b.uuid = bc.uuid where b.uuid = ?;", req.body.uuid, (err, result) => {
        if (err) return res.status(404).json(err)
        else {
            db.query("update board set view=view + 1 where uuid=?;", req.body.uuid)

            db.query("select * from board_file where uuid = ?;", req.body.uuid, (err, trex) => {
                if (trex) res.status(200).json({ board: result, file: trex })
                else res.status(200).json({ board: result })
            })
        }
    })
}

exports.getboard = (req, res) => {
    db.query("select b.title, bc.content, b.maker from board b join board_content bc on b.uuid = bc.uuid where b.uuid = ?;", req.body.uuid, (err, result) => {
        if (err) return res.status(404).json(err)
        else {
            db.query("select * from board_file where uuid = ?;", req.body.uuid, (err, trex) => {
                if (trex) res.status(200).json({ board: result, file: trex })
                else res.status(200).json({ board: result })
            })
        }
    })
}

exports.updateboard = (req, res) => {
    if (req.body.content.trim().length == 0 || req.body.title.trim().length == 0) return res.status(405).json({message : "공백은 입력할 수 없습니다."})
    else if(req.body.content.trim().length >= 1000 || req.body.title.trim().length >= 20) return res.status(406).json({message : "제한길이를 넘겼습니다."})

    db.query("update board set title = ? where uuid = ?;", [req.body.title, req.body.uuid], (err) => {
        if (err) return res.status(404).json(err)
    })

    db.query("update board_content set content = ? where uuid = ?;", [req.body.content, req.body.uuid], (err) => {
        if (err) return res.status(404).json(err)
    })
    res.status(200).json()
}

exports.deleteboard = (req, res) => {
    db.query("select maker from board where uuid = ?;", req.body.uuid, (err, result) => {
        if (err) return res.status(404).json(err)
        else if (result.length === 0) return res.status(404).json()
        else if (req.session.user.username != result[0].maker) return res.status(404).json()
        else {
            db.query("select * from board_file where uuid = ?;", req.body.uuid, (err0, re) => {
                if (err0) return res.status(500).json(err0);
                if (re.length > 0) {
                    const folderpath = path.join(__dirname, "../uploads", req.body.uuid)
                    fs.rmSync(folderpath, { recursive: true }, (err1) => {
                        if (err1) return res.status(404).json(err1)
                        else {
                            db.query("delete from board_file where uuid = ?;", req.body.uuid, (err2) => {
                                if (err2) return res.status(404).json(err2)
                            })
                        }
                    })
                }
            })

            db.query("delete from board_content where uuid = ?;", req.body.uuid, (err1) => {
                if (err1) return res.status(404).json(err1)

                db.query("delete from board where uuid = ?;", req.body.uuid, (err2) => {
                    if (err2) return res.status(404).json(err2)

                    db.query("select * from board where uuid = ?;", req.body.uuid, (err3, check) => {
                        if (err3) return res.status(404).json(err3)
                        
                        if(check.length === 0) return res.status(200).json()
                        else return res.status(404).json
                    })
                })
            })
        }
    })
}

exports.uploadfile = (req, res) => {
    if (!req.file) return res.status(404).json()
    db.query("insert into board_file(uuid, filename, maker) value (?,?,?);", [req.body.uuid, req.file.filename, req.session.user.username], (err, result) => {
        if (err) return res.status(404).json()
        else return res.status(200).json()
    })
}

exports.downloadfile = (req, res) => {
    const folderpath = path.join(__dirname, "../uploads", req.params.uuid)

    if (!fs.existsSync(folderpath)) {
        return res.status(404).json();
    }

    fs.readdir(folderpath, (err, files) => {
        if (err) return res.status(500).json()

        const filename = files[0]
        const filepath = path.join(folderpath, files[0])

        res.download(filepath, filename, (e) => {
            if (e) return res.status(500).json()
            return
        })
    })
}

exports.checkfile = (req, res) => {
    const file = req.file;
    const allow = [".txt", ".hwp", ".pdf", ".jpg", ".png"]
    const ext = path.extname(file.originalname).toLocaleLowerCase();

    if (!allow.includes(ext)) {
        fs.unlinkSync(file.path)
        db.query("delete from board where uuid = ?", req.body.uuid)
        db.query("delete from board_content where uuid = ?", req.body.uuid)
        return res.status(415).json({message: "허용되지 않은 확장자입니다."})
    }
}