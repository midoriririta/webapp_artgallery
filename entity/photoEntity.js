'use strict'
var _ = require('lodash')
var util = require('../util')
var rapidApi = require('../entity/rapidApi')
var fs = require('fs')
var path = require('path')

var photoEntity = {
    getGalleryPhotos: function (galleryId) {
        return util.readPhotosData(galleryId)
    },
    find: function (galleryId, photoId) {
        return _.find(util.readPhotosData(galleryId), { id: photoId })
    },
    search: function (galleryId, keywords) {
        var all = photoEntity.getGalleryPhotos(galleryId)
        if (!keywords) {
            return all
        }
        return _.filter(all, function (item) {
            return item.name.toLowerCase().indexOf(keywords.toLowerCase()) !== -1
        })
    },
    delete: function (galleryId, photoId) {
        if (!galleryId) {
            throw new Error("Can't delete photo, galleryId unavailable.")
        }
        if (!photoId) {
            throw new Error("Can't delete photo, photoId unavailable.")
        }
        var photos = photoEntity.getGalleryPhotos(galleryId)
        var item = _.find(photos, { id: photoId })
        // if photo exists
        if (!item) {
            throw new Error(`Can't delete photo, photo ${photoId} not exists!`)
        }
        _.remove(photos, function (item) {
            return item.id === photoId
        })
        util.writePhotosData(galleryId, photos)
        return item
    },
    rename: function (galleryId, photoId, newName) {
        if (!galleryId) {
            throw new Error("Can't rename photo, galleryId unavailable.")
        }
        if (!photoId) {
            throw new Error("Can't rename photo, photoId unavailable.")
        }
        if (!newName) {
            throw new Error("Can't rename photo, newName unavailable.")
        }
        var photos = photoEntity.getGalleryPhotos(galleryId)
        var item = _.find(photos, { id: photoId })
        // if photo exists
        if (!item) {
            throw new Error(`Can't rename photo, photo ${photoId} not exists!`)
        }
        _.remove(photos, function (item) {
            return item.id === photoId
        })
        item.name = newName
        photos.push(item)
        util.writePhotosData(galleryId, photos)
        return item
    },
    tag: function (galleryId, photoId) {
        var promise = new Promise((resolve, reject) => {
            try {
                var photo = _.find(util.readPhotosData(galleryId), { id: photoId })
                if (!photo) {
                    resolve([])
                } else {
                    var file = util.resloveUrl(path.join(path.resolve('.'), photo.file))
                    if (fs.existsSync(file)) {
                        rapidApi.uploadContent(file, (contentId) => {
                            rapidApi.tagging(contentId, (tags) => {
                                resolve(tags)
                            })
                        })
                    } else {
                        resolve([])
                    }
                }
            } catch (e) {
                reject(e)
            }
        })
        return promise
    }
}

module.exports = photoEntity
