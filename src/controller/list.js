const db = require("../config/db")
const fs = require("fs")
const path = require("path");
const { v4: uuidv4 } = require('uuid');

exports.checkboard = (req, res) => {
    db.query("SELECT uuid, title, maker, DATE_FORMAT(date, '%Y-%m-%d') AS date, view from board;", (err, result) => {
        if (err) {
            res.status(202).json(err)
        } else {
            res.status(200).json({ result })
        }
    })
}

exports.addboard = (req, res) => {
    const uuid = uuidv4();
    db.query("insert into board_content(uuid, content, maker) value (?,?,?);", [uuid, req.body.content, req.session.user.username], (err) => {
        if (err) res.status(404).json(err)
    })

    db.query("insert into board(uuid, title, maker) value(?, ?, ?);", [uuid, req.body.title, req.session.user.username], (err) => {
        if (err) res.status(404).json(err)
    })
    res.status(200).json({ uuid: uuid })
}

exports.lookboard = (req, res) => {
    db.query("select b.title, bc.content, b.maker, b.view, DATE_FORMAT(b.date, '%Y-%m-%d') AS date from board b join board_content bc on b.uuid = bc.uuid where b.uuid = ?;", req.body.uuid, (err, result) => {
        if (err) {
            res.status(404).json(err)
        }
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
        if (err) {
            res.status(404).json(err)
        }
        else {
            db.query("select * from board_file where uuid = ?;", req.body.uuid, (err, trex) => {
                if (trex) res.status(200).json({ board: result, file: trex })
                else res.status(200).json({ board: result })
            })
        }
    })
}

exports.updateboard = (req, res) => {
    db.query("update board set title = ? where uuid = ?;", [req.body.title, req.body.uuid], (err) => {
        if (err) return res.status(404).json(err)
    })

    db.query("update board_content set content = ? where uuid = ?;", [req.body.content, req.body.uuid], (err) => {
        if (err) res.status(404).json(err)
    })
    res.status(200).json()
}

exports.deleteboard = (req, res) => {
    db.query("select maker from board where uuid = ?;", req.body.uuid, (err, result) => {
        if (err) return res.status(404).json(err)
        else if (result.length === 0) return res.status(404).json("no result")
        else if (req.session.user.username != result[0].maker) {
            return res.status(404).json("not same")
        } else {
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
                if (err1) res.status(404).json(err1)

                db.query("delete from board where uuid = ?;", req.body.uuid, (err2) => {
                    if (err2) res.status(404).json(err2)

                    db.query("select * from board where uuid = ?;", req.body.uuid, (err3, check) => {
                        if (err3) res.status(404).json(err3)
                        
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