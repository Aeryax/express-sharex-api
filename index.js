const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const md5 = require('md5');
const crc = require('crc');
const mime = require('mime');

const API_KEY = 'TEST';
const FILESIZE = 5 * 1024 * 1024; // 5 MO
const UPLOAD_DIR = './uploads/';
const RESTRICT_MIME = false;
const ALLOWED_MIME_IMAGE = ['image/png', 'image/jpeg'];
const ALLOWED_MIME_VIDEO = [];
const ALLOWED_MIME_FILE = [];

app.use(fileUpload({
    limits: { fileSize: FILESIZE }
}));

app.post('/upload', function (req, res) {
    if(!req.body.key || req.body.key !== API_KEY)
        return res.status(403).send('INVALID_KEY')


    if (!req.files)
        return res.status(400).send('FILE_NOT_FOUND');

    let file = req.files.fdata;
    let ext = mime.extension(file.mimetype);

    if(RESTRICT_MIME && !ALLOWED_MIME_IMAGE.includes(file.mimetype) && !ALLOWED_MIME_VIDEO.includes(file.mimetype) && !ALLOWED_MIME_FILE.includes(file.mimetype)) {
        return res.status(400).send('FILE_NOT_ALLOWED');
    }

    let signature = crc.crc32(md5(file.data)).toString(16);

    let filename = signature + '.' + ext;

    // Use the mv() method to place the file somewhere on your server
    file.mv(UPLOAD_DIR + filename, (err) => {
        if (err)
            return res.status(500).send('SERVER_ERROR');

        res.send(req.protocol + '://' + req.hostname + '/u/' + filename);
    });
});

app.listen(3000, () => {
    console.log('running');
})