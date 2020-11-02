'use strict'
var express = require('express')
var router = express.Router()
var multer = require('multer')
var fs = require('fs'); var path = require('path')

var jsonResult = require('../entity/jsonResult')
var galleryEntity = require('../entity/galleryEntity')
var tempPath = path.sep + 'temp'

// GET /api/gallery
router.get('/', function (req, res) {
    res.json(jsonResult.success('OK', galleryEntity.all()))
})

// GET /api/gallery/detail?id=?
router.get('/detail', function (req, res) {
    if (!req.query.id) {
        res.json(jsonResult.paramInvalidFailed('id'))
        return
    }
    var gallery = galleryEntity.find(req.query.id)
    if (!gallery) {
        res.json(jsonResult.logicFailed(`Gallery with id ${req.query.id} not exists!`))
        return
    }
    res.json(jsonResult.success('OK', gallery))
})

// GET /api/gallery/search?keywords=?
router.get('/search', function (req, res) {
    var keywords = req.query.keywords
    if (!keywords) {
        res.json(jsonResult.paramInvalidFailed('keywords'))
        return
    }
    res.json(jsonResult.success('OK', galleryEntity.search(keywords)))
})

// POST /api/gallery/create?galleryName=<galleryName>
router.post('/create', function (req, res) {
    if (!req.session.userInfo) {
        res.status(403).json(jsonResult.success('Access denied.'))
        return
    }
    try {
        var data = galleryEntity.create(req.body.galleryName)
        res.json(jsonResult.success('OK', data))
    } catch (e) {
        res.json(jsonResult.logicFailed(e.message))
    }
})

// POST /api/gallery/rename?galleryId=<galleryId>&newName=<newName>
router.post('/rename', function (req, res) {
    if (!req.session.userInfo) {
        res.status(403).json(jsonResult.success('Access denied.'))
        return
    }
    try {
        var galleryId = req.body.galleryId
        var newName = req.body.newName

        res.json(jsonResult.success('OK', galleryEntity.rename(galleryId, newName)))
    } catch (e) {
        res.json(jsonResult.logicFailed(e.message))
    }
})

// POST /api/gallery/delete?id=<id>
router.post('/delete', function (req, res) {
    if (!req.session.userInfo) {
        res.status(403).json(jsonResult.success('Access denied.'))
        return
    }
    try {
        var gallery = galleryEntity.find(req.body.id)
        var data = galleryEntity.delete(gallery)
        res.json(jsonResult.success('OK', data))
    } catch (e) {
        res.json(jsonResult.logicFailed(e.message))
    }
})

var getMulterStorage = function () {
    var dir = path.resolve('.') + tempPath
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }
    return multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, '.' + tempPath)
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    })
}
var upload = multer({ storage: getMulterStorage() })
// POST /api/gallery/upload?galleryName=<galleryName>&pictures=<file>
router.post('/upload', upload.single('pictures'), function (req, res, next) {
    var id = req.body.galleryName
    var file = req.file
    if (id && file) {
        var gallery = galleryEntity.find(id)
        galleryEntity.uploadPicture(gallery, file.originalname)
        res.json(jsonResult.success(
            'Upload file success.', `/${gallery.name}/${file.filename}`
        ))
    } else {
        res.json(jsonResult.logicFailed('No file uploaded.[image field pictures]'))
    }
})

module.exports = router
