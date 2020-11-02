'use strict'
var _ = require('lodash')
var fs = require('fs')
var path = require('path')
var util = require('../util')
var photoEntity = require('./photoEntity')

var galleryEntity = {
    all: function () {
        try {
            if (!fs.existsSync(util.galleryDataPath())) {
                util.writeGalleryData([])
                return []
            }
            var ret = []
            util.readGalleryData().forEach((gallery, index) => {
                var photos = photoEntity.getGalleryPhotos(gallery.id)
                gallery.cover = _.first(photos)
                gallery.count = photos.length
                ret.push(gallery)
            })
            return ret
        } catch (e) {
            console.log(`Get gallerys failed, check the file [gallery.json] access permission!`, e)
            return []
        }
    },
    create: function (galleryName) {
        if (!galleryName) {
            throw new Error("Can't create gallery, gallery name unavailable.")
        }
        var all = galleryEntity.all(); var id = util.toBase64(galleryName)
        var item = _.find(all, { id: id })
        // if exists this gallery name
        if (item) {
            throw new Error("Can't create gallery, gallery name exists yet!")
        }
        util.createGalleryDir(galleryName)
        var created = {
            id: id,
            name: galleryName
        }
        all.push(created)
        util.writeGalleryData(all)
        return created
    },
    rename: function (galleryId, newGalleryName) {
        if (!galleryId) {
            throw new Error("Can't rename gallery, galleryId unavailable.")
        }
        if (!newGalleryName) {
            throw new Error("Can't rename gallery, newGalleryName unavailable.")
        }
        var all = galleryEntity.all()
        var item = _.find(all, { id: galleryId })
        if (!item) {
            throw new Error(`Can't update gallery, gallery ${galleryId} not exists!`)
        }
        var oldGalleryName = item.name
        util.moveFile(util.galleryPath(oldGalleryName), util.galleryPath(newGalleryName))

        var newPhotoData = []
        var gallerysPhotos = util.readPhotosData(galleryId)
        gallerysPhotos.forEach((photo, index) => {
            var platform = require('os').platform()
            var fileSepReg = ''
            if (platform === 'win32') {
                fileSepReg = '\\\\'
            } else {
                fileSepReg = '/'
            }
            var fileReg = new RegExp(fileSepReg + oldGalleryName + fileSepReg, 'ig')
            var urlReg = new RegExp('/' + oldGalleryName + '/', 'ig')
            photo.file = photo.file.replace(fileReg, path.sep + newGalleryName + path.sep)
            photo.url = photo.url.replace(urlReg, '/' + newGalleryName + '/')
            newPhotoData.push(photo)
        })
        util.writePhotosData(galleryId, newPhotoData)
        _.remove(all, function (item) {
            return item.id === galleryId
        })
        all.push({
            id: item.id,
            name: newGalleryName
        })
        util.writeGalleryData(all)
        return item
    },
    clear: function () {
        var all = galleryEntity.all()
        all.forEach((gallery) => {
            // util.removeGalleryDir(gallery.name)
            util.removeGalleryPhotoData(gallery.id)
        })
        util.writeGalleryData([])
    },
    delete: function (gallery) {
        var galleryName = gallery.name
        var all = galleryEntity.all()
        var item = _.find(all, { id: gallery.id })
        // if exists this gallery name
        if (!item) {
            throw new Error(`Can't delete gallery, gallery ${galleryName} not exists!`)
        }
        util.removeGalleryDir(galleryName)
        util.removeGalleryPhotoData(gallery.id)
        _.remove(all, function (item) {
            return item.name === galleryName
        })
        util.writeGalleryData(all)
        return item
    },
    find: function (galleryId) {
        var gallery = _.find(galleryEntity.all(), { id: galleryId })
        if (gallery) {
            gallery.photos = photoEntity.getGalleryPhotos(gallery.id)
        }
        return gallery
    },
    search: function (keywords) {
        var all = galleryEntity.all()
        if (!keywords) {
            return all
        }
        return _.filter(all, function (item) {
            return item.name.toLowerCase().indexOf(keywords.toLowerCase()) !== -1
        })
    },
    uploadPicture: function (gallery, fileName) {
        var galleryName = gallery.name
        var tempFile = util.tempFile(fileName)
        var destFile = util.photoFullPath(galleryName, fileName)
        if (!galleryName) {
            throw new Error("Can't upload picture to gallery, gallery name unavailable.")
        }
        var photoId = util.toBase64(fileName)
        var photos = util.readPhotosData(gallery.id)
        var picture = _.find(photos, { id: photoId })
        if (!picture) {
            picture = {
                id: photoId,
                name: util.getFileNameWithoutExt(fileName),
                file: util.photoPath(galleryName, fileName),
                url: util.photoUrl(galleryName, fileName),
                time: new Date().getTime()
            }
            photos.push(picture)

            util.writePhotosData(gallery.id, photos)
            util.moveFile(tempFile, destFile)
            return true
        }
        return false
    },
    // just for test
    uploadPictureTest: function (gallery, fileName) {
        var galleryName = gallery.name
        if (!galleryName) {
            throw new Error("Can't upload picture to gallery, gallery name unavailable.")
        }
        var photoId = util.toBase64(fileName)
        var photos = util.readPhotosData(gallery.id)
        var picture = _.find(photos, { id: photoId })
        if (!picture) {
            picture = {
                id: photoId,
                name: util.getFileNameWithoutExt(fileName),
                file: util.photoPath(galleryName, fileName),
                url: util.photoUrl(galleryName, fileName),
                time: new Date().getTime()
            }
            photos.push(picture)

            util.writePhotosData(gallery.id, photos)
            return true
        }
        return false
    }
}

module.exports = galleryEntity
