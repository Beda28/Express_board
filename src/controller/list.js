const db = require("../config/db")
const fs = require("fs")
const path = require("path");
const { v4: uuidv4 } = require('uuid');

exports.checkboard = (req, res) => {
    db.query("SELECT uuid, title, maker, DATE_FORMAT(date, '%Y-%m-%d') AS formatted_date, view FROM board ORDER BY date DESC;", (err, result) => {
        if (err) {
            return res.status(202).json(err)
        } else {
            return res.status(200).json({ result })
        }
    })
}

exports.search = (req, res) => {
    db.query("SELECT uuid, title, maker, DATE_FORMAT(date, '%Y-%m-%d') AS formatted_date, view FROM board WHERE title LIKE CONCAT('%', ?, '%') OR maker LIKE CONCAT('%', ?, '%') ORDER BY date DESC;", [req.body.search, req.body.search, req.body.search], (err, result) => {
        if (err) return res.status(202).json(err)
        else return res.status(200).json({result})
    })
}

exports.addboard = (req, res) => {
    const now = new Date();
    const uuid = uuidv4();

    if (req.body.content.trim().length == 0 || req.body.title.trim().length == 0) return res.status(405).json({message : "공백은 입력할 수 없습니다."})
    else if(req.body.content.trim().length >= 1000 || req.body.title.trim().length >= 20) return res.status(406).json({message : "제한길이를 넘겼습니다."})

    const lastPostTime = req.session.lastPostTime ? new Date(req.session.lastPostTime) : null;
    if (lastPostTime && (now - lastPostTime) / 1000 <= 3) {
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
                if (trex) return res.status(200).json({ board: result, file: trex })
                else return res.status(200).json({ board: result })
            })
        }
    })
}

exports.getboard = (req, res) => {
    db.query("select b.title, bc.content, b.maker from board b join board_content bc on b.uuid = bc.uuid where b.uuid = ?;", req.body.uuid, (err, result) => {
        if (err) return res.status(404).json(err)
        else {
            db.query("select * from board_file where uuid = ?;", req.body.uuid, (err, trex) => {
                if (trex) return res.status(200).json({ board: result, file: trex })
                else return res.status(200).json({ board: result })
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
    return res.status(200).json()
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
                        else return res.status(404).json()
                    })
                })
            })
        }
    })
}

exports.uploadfile = (req, res) => {
    if (!req.files || !req.files.file || req.files.file.length === 0) return res.status(400).json("파일이 없습니다.");
    const file = req.files.file[0]; 

    db.query("insert into board_file(uuid, filename, maker) value (?,?,?);", [req.body.uuid, file.filename, req.session.user.username], (err, result) => {
        if (err) return res.status(404).json()
        else return res.status(200).json()
    })
}

exports.downloadfile = (req, res) => {
    const { uuid } = req.params;

    if (uuid.includes("..") || uuid.includes("/") || uuid.includes("\\")) return res.status(400).send("잘못된 파일 요청입니다.");

    const folderPath = path.join(__dirname, "../uploads", uuid);
    if (!fs.existsSync(folderPath)) return res.status(404).send("해당 파일을 찾을 수 없습니다.");

    fs.readdir(folderPath, (err, files) => {
        if (err) return res.status(500).send("서버 오류");
        if (files.length === 0) return res.status(404).send("폴더에 파일이 없습니다.");

        const filename = files[0];
        const filePath = path.join(folderPath, filename);

        res.download(filePath, filename, (err) => {
            if (err) {
                console.error("파일 다운로드 오류:", err);
                return res.status(500).send("다운로드 실패");
            }
        });
    });
};
