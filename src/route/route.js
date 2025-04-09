const express = require("express");
const multer = require("multer")
const fs = require("fs")
const path = require("path");
const router = express.Router()
const session = require("../controller/session")
const list = require("../controller/list")

const upload = multer({
    storage:
        multer.diskStorage({
            destination: (req, file, cb) => {
                const { uuid } = req.body;
                const uploadPath = path.join(__dirname, "../uploads", uuid);

                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }

                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const encodedName = Buffer.from(file.originalname, 'utf8').toString('latin1');
                cb(null, encodedName);
            }
        })
});

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

router.post('/upload', upload.single('file'), (req, res) => {
    list.uploadfile(req, res);
})

router.get('/download/:uuid', (req, res) => {
    list.downloadfile(req, res);
})

module.exports = router;