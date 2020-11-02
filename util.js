'use strict'
var fs = require('fs')
var path = require('path')
var os = require('os')

var util = {
    rootPath: function () {
        return path.resolve('.')
    },
    uploadPath: function () {
        return `${util.rootPath()}${path.sep}uploadfiles${path.sep}`
    },
    galleryPath: function (galleryName) {
        return util.uploadPath() + galleryName + path.sep
    },
    photoPath: function (galleryName, photoFileName) {
        var path = util.galleryPath(galleryName) + photoFileName
        var rootPath = util.rootPath()
        return path.substring(rootPath.length)
    },
    photoFullPath: function (galleryName, photoFileName) {
        return util.galleryPath(galleryName) + photoFileName
    },
    configPath: function () {
        return `${util.rootPath()}${path.sep}configs${path.sep}`
    },
    galleryDataPath: function () {
        return util.configPath() + 'gallery.json'
    },
    photoDataPath: function (galleryId) {
        return util.configPath() + galleryId + '.json'
    },
    photoUrl: function (galleryName, fileName) {
        return '/' + galleryName + '/' + fileName
    },
    tempFile: function (fileName) {
        return `${util.rootPath()}${path.sep}temp${path.sep}${fileName}`
    },
    toBase64: function (str) {
        if (!str) {
            return ''
        }
        return Buffer.from(str).toString('base64')
    },
    fromBase64: function (str) {
        return Buffer.from(str, 'base64').toString()
    },
    writeJsonDataToFile: function (file, data) {
        try {
            var json = JSON.stringify(data)
            fs.writeFileSync(file, json)
        } catch (e) {
            console.debug && console.debug(`Write json file [${file}] failed!`, e)
        }
    },
    writeGalleryData: function (data) {
        var file = util.galleryDataPath()
        util.writeJsonDataToFile(file, data)
    },
    writePhotosData: function (galleryId, data) {
        var photoFile = util.photoDataPath(galleryId)
        util.writeJsonDataToFile(photoFile, data)
    },
    readJsonDataFromFile: function (file) {
        try {
            if (fs.existsSync(file)) {
                var json = fs.readFileSync(file)
                return JSON.parse(json)
            }
        } catch (e) {
            console.debug && console.debug(`Read json file [${file}] failed!`, e)
        }
        return null
    },
    readGalleryData: function () {
        return util.readJsonDataFromFile(util.galleryDataPath()) || []
    },
    readPhotosData: function (galleryId) {
        var photoFile = util.photoDataPath(galleryId)
        return util.readJsonDataFromFile(photoFile) || []
    },
    createDir: function (dir) {
        try {
            if (fs.existsSync(dir)) {
                return
            }
            fs.mkdirSync(dir, { recursive: true })
        } catch (e) {
            console.debug && console.debug(`Create directory [${dir}] failed!`, e)
        }
    },
    createGalleryDir: function (galleryName) {
        var dir = util.galleryPath(galleryName)
        util.createDir(dir)
    },
    removeDir: function (dir) {
        // recurse delete directory
        var deleteDir = function (_path) {
            var files = []
            if (fs.existsSync(_path)) {
                files = fs.readdirSync(_path)
                files.forEach(function (file, index) {
                    var curPath = _path + path.sep + file
                    if (fs.statSync(curPath).isDirectory()) {
                        deleteDir(curPath)
                    } else {
                        fs.unlinkSync(curPath)
                    }
                })
                fs.rmdirSync(_path)
            }
        }
        try {
            deleteDir(dir)
        } catch (e) {
            console.debug && console.debug(`Delete directory [${dir}] failed!`, e)
        }
    },
    removeGalleryDir: function (galleryName) {
        var galleryDir = util.galleryPath(galleryName)
        util.removeDir(galleryDir)
    },
    removeFile: function (file) {
        try {
            if (!fs.existsSync(file)) {
                return
            }
            fs.unlinkSync(file)
        } catch (e) {
            console.debug && console.debug(`Delete file [${file}] failed!`, e)
        }
    },
    removeGalleryPhotoData: function (galleryId) {
        util.removeFile(util.photoDataPath(galleryId))
    },
    moveFile: function (src, dest) {
        if (!fs.existsSync(src)) {
            return
        }
        if (fs.existsSync(dest)) {
            return
        }
        fs.renameSync(src, dest)
    },
    getFileExt: function (path) {
        return path.substring(path.lastIndexOf('.'))
    },
    getFileNameWithoutExt: function (path) {
        return path.substring(0, path.length - util.getFileExt(path).length)
    },
    log: function (level, msg, data) {
        var msgFormat = `${util.formatTime(new Date())} [${level.toUpperCase()}] ${msg}`
        if (data) {
            console.log(msgFormat, data)
        } else {
            console.log(msgFormat)
        }
    },
    logInfo: function (msg, data) {
        util.log('INFO', msg, data)
    },
    logError: function (msg, data) {
        util.log('ERROR', msg, data)
    },
    formatTime: function (date, format) {
        var fix2number = (n) => {
            return [0, n].join('').slice(-2)
        }
        format = format || 'yyyy-MM-dd HH:mm:ss'
        format = format.replace(/yyyy/g, date.getFullYear())
        format = format.replace(/yy/g, date.getFullYear().toString().substring(2))
        format = format.replace(/MM/g, fix2number(date.getMonth() + 1))
        format = format.replace(/M/g, date.getMonth() + 1)
        format = format.replace(/dd/g, fix2number(date.getDate()))
        format = format.replace(/d/g, date.getDate())
        format = format.replace(/HH/g, fix2number(date.getHours()))
        format = format.replace(/H/g, date.getHours())
        format = format.replace(/mm/g, fix2number(date.getMinutes()))
        format = format.replace(/m/g, date.getMinutes())
        format = format.replace(/ss/g, fix2number(date.getSeconds()))
        format = format.replace(/s/g, date.getSeconds())
        format = format.replace(/ffff/g, date.getMilliseconds())
        return format
    },
    resloveUrl: function (url) {
        if (os.platform() === 'win32') {
            url = url.replace(/\//ig, '\\')
        } else {
            url = url.replace(/\\/ig, '/')
        }
        return url
    },
    rapidCacheDataPath: function () {
        return util.configPath() + 'rapid-cache.json'
    },
    readRapidCacheData: function () {
        var rapidCacheFile = util.rapidCacheDataPath()
        return util.readJsonDataFromFile(rapidCacheFile) || {}
    },
    writeRapidCacheData: function (data) {
        var rapidCacheFile = util.rapidCacheDataPath()
        util.writeJsonDataToFile(rapidCacheFile, data)
    }
}

module.exports = util
