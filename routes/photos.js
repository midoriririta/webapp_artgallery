'use strict'
var express = require('express')
var router = express.Router()

var jsonResult = require('../entity/jsonResult')
var photoEntity = require('../entity/photoEntity')

// GET /api/photo/detail?galleryId=<galleryId>&photoId=<photoId>
router.get('/detail', function (req, res) {
    var galleryId = req.query.galleryId
    if (!galleryId) {
        res.json(jsonResult.paramInvalidFailed('galleryId'))
        return
    }
    var photoId = req.query.photoId
    if (!photoId) {
        res.json(jsonResult.paramInvalidFailed('photoId'))
        return
    }
    var photo = photoEntity.find(galleryId, photoId)
    if (!photo) {
        res.json(jsonResult.logicFailed(`Photo [${galleryId}/${photoId}] not exists!`))
        return
    }
    res.json(jsonResult.success('OK', photo))
})

// GET /api/photo/search?galleryId=<galleryId>&keywords=<keywords>
router.get('/search', function (req, res) {
    var galleryId = req.query.galleryId
    var keywords = req.query.keywords
    if (!galleryId || !keywords) {
        res.json(jsonResult.paramInvalidFailed('galleryId/keywords'))
        return
    }
    res.json(jsonResult.success('OK', photoEntity.search(galleryId, keywords)))
})

// POST /api/photo/delete?galleryId=<galleryId>&photoId=<id>
router.post('/delete', function (req, res) {
    if (!req.session.userInfo) {
        res.status(403).json(jsonResult.success('Access denied.'))
        return
    }
    try {
        var galleryId = req.body.galleryId
        var photoId = req.body.photoId

        res.json(jsonResult.success('OK', photoEntity.delete(galleryId, photoId)))
    } catch (e) {
        res.json(jsonResult.logicFailed(e.message))
    }
})

// POST /api/photo/rename?galleryId=<galleryId>&photoId=<photoId>&newName=<newName>
router.post('/rename', function (req, res) {
    if (!req.session.userInfo) {
        res.status(403).json(jsonResult.success('Access denied.'))
        return
    }
    try {
        var galleryId = req.body.galleryId
        var photoId = req.body.photoId
        var newName = req.body.newName

        res.json(jsonResult.success('OK', photoEntity.rename(galleryId, photoId, newName)))
    } catch (e) {
        res.json(jsonResult.logicFailed(e.message))
    }
})

// GET /api/photo/tag?galleryId=<galleryId>&photoId=<id>
router.get('/tag', function (req, res) {
    photoEntity.tag(req.query.galleryId, req.query.photoId).then((tags) => {
        res.json(jsonResult.success('OK', tags))
    }).catch((e) => {
        res.json(jsonResult.logicFailed(e))
    })
})

module.exports = router
