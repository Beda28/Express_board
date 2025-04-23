const express = require("express");
const multer = require("multer")
const fs = require("fs")
const path = require("path");
const router = express.Router()
const session = require("../controller/session")
const list = require("../controller/list")
const iconv = require('iconv-lite');

const allow = ['.png', '.jpg', '.jpeg', '.pdf', '.txt', '.zip'];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uuid = req.body.uuid || (req.body['uuid']?.[0]);
        const uploadPath = path.join(__dirname, "../uploads", uuid);

        try {
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath);
        } catch (err) {
            console.error("디렉토리 생성 오류:", err);
            cb(err);
        }
    },
    filename: (req, file, cb) => {
        const raw = Buffer.from(file.originalname, 'latin1');
        const decoded = iconv.decode(raw, 'utf8');
        const safeName = decoded.replace(/[\\/:*?"<>|]/g, "_");
        cb(null, safeName);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allow.includes(ext)) {
        return cb(new Error("허용되지 않는 확장자입니다."), false);
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter
}).fields([
    { name: 'file', maxCount: 1 },
    { name: 'uuid', maxCount: 1 }
]);


router.get('/checklogin', (req, res) => {
    if (req.session.user) {
        res.status(201).json(req.session.user)
    }
    else {
        res.status(200).json()
    }
})

router.post('/login', (req, res) => {
    session.login(req, res);
})

router.post('/register', (req, res) => {
    session.register(req, res);
})

router.get('/logout', (req, res) => {
    session.logout(req, res);
})

router.post('/search', (req, res) =>{
    list.search(req, res)
})

router.get('/checklist', (req, res) => {
    list.checkboard(req, res);
})

router.post('/addboard', (req, res) => {
    list.addboard(req, res);
})

router.post('/lookboard', (req, res) => {
    list.lookboard(req, res);
})

router.post('/getboard', (req, res) => {
    list.getboard(req, res);
})

router.post('/updateboard', (req, res) => {
    list.updateboard(req, res);
})

router.post('/deleteboard', (req, res) => {
    list.deleteboard(req, res);
})

router.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(500).send("파일 업로드 오류");
        } else if (err) {
            return res.status(415).send("허용되지 않는 확장자입니다.");
        }

        list.uploadfile(req, res);
    });
});

router.get('/download/:uuid', (req, res) => {
    list.downloadfile(req, res);
})

module.exports = router;