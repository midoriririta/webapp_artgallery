'use strict'
var unirest = require('unirest')
var fs = require('fs')
var rapidEntity = require('./rapidEntity')

var rapidApiKey = '7b57cbb114msh5b4a5923bba65eap15e14ejsn7aa6f3fb1793'
var rapidApiUrls = {
    content: function () {
        return 'https://imagga-api.p.rapidapi.com/content'
    },
    tagging: function (contentId) {
        return 'https://imagga-api.p.rapidapi.com/tagging?content=' + contentId
    }
}

var rapidApi = {
    uploadContentAsync: function (filePath) {
        var promise = new Promise((resolve, reject) => {
            try {
                var cache = rapidEntity.find(filePath)
                if (cache) {
                    resolve(cache)
                } else {
                    unirest.post(rapidApiUrls.content())
                        .header('X-RapidAPI-Key', rapidApiKey)
                        .attach('file', fs.createReadStream(filePath))
                        .end(function (res) {
                            if (res.error) {
                                reject(res.error)
                            } else {
                                var contentId = res.body.uploaded[0].id
                                rapidEntity.create(filePath, contentId)
                                resolve(contentId)
                            }
                        })
                }
            } catch (e) {
                reject(e)
            }
        })
        return promise
    },
    uploadContent: function (filePath, resolve, reject) {
        try {
            var cache = rapidEntity.find(filePath)
            if (cache) {
                resolve && resolve(cache)
            } else {
                unirest.post(rapidApiUrls.content())
                    .header('X-RapidAPI-Key', rapidApiKey)
                    .attach('file', fs.createReadStream(filePath))
                    .end(function (res) {
                        if (res.error) {
                            reject && reject(res.error)
                        } else {
                            var contentId = res.body.uploaded[0].id
                            rapidEntity.create(filePath, contentId)
                            resolve && resolve(contentId)
                        }
                    })
            }
        } catch (e) {
            reject && reject(e)
        }
    },
    taggingAsync: function (contentId) {
        var promise = new Promise((resolve, reject) => {
            try {
                unirest.get(rapidApiUrls.tagging(contentId))
                    .header('X-RapidAPI-Key', rapidApiKey)
                    .end(function (res) {
                        if (res.error) {
                            reject(res.error)
                        } else {
                            var tags = []
                            if (res.body.results.length > 0) {
                                var _tags = res.body.results[0].tags
                                if (_tags) {
                                    _tags.forEach((tag) => {
                                        if (tag.confidence >= 30 && tags.length < 5) {
                                            tags.push(tag.tag)
                                        }
                                    })
                                }
                            }
                            resolve(tags)
                        }
                    })
            } catch (e) {
                reject(e)
            }
        })
        return promise
    },
    tagging: function (contentId, resolve, reject) {
        try {
            unirest.get(rapidApiUrls.tagging(contentId))
                .header('X-RapidAPI-Key', rapidApiKey)
                .end(function (res) {
                    if (res.error) {
                        reject && reject(res.error)
                    } else {
                        var tags = []
                        if (res.body.results.length > 0) {
                            var _tags = res.body.results[0].tags
                            if (_tags) {
                                _tags.forEach((tag) => {
                                    if (tag.confidence >= 30 && tags.length < 5) {
                                        tags.push(tag.tag)
                                    }
                                })
                            }
                        }
                        resolve && resolve(tags)
                    }
                })
        } catch (e) {
            reject && reject(e)
        }
    }
}

module.exports = rapidApi
