var galleryEntity = require('./entity/galleryEntity')
var photoEntity = require('./entity/photoEntity')
var userEntity = require('./entity/userEntity')
var jsonResult = require('./entity/jsonResult')
var util = require('./util')

var testGalleryName1 = "My Test Gallery1";
var testGalleryName2 = "My Test Gallery2";
var testGalleryName3 = "My Test Gallery3";
var testFileName = "testfile.png";
var galleryId1 = util.toBase64(testGalleryName1);
var galleryId2 = util.toBase64(testGalleryName2);
var galleryId3 = util.toBase64(testGalleryName3);
var photoId = util.toBase64(testFileName);

//api test
var supertest = require("supertest")
var app = require("./app");
var request = supertest(app);

//Before each test, clears the data and adds some testing data.
beforeEach(() => {
    galleryEntity.clear();
    galleryEntity.create(testGalleryName1);
    galleryEntity.create(testGalleryName2);

    var gallery = galleryEntity.find(galleryId1);
    galleryEntity.uploadPictureTest(gallery, testFileName);
}, 10000);

afterAll(() => {
    //galleryEntity.clear();
}, 10000);

describe("Test entities", () => {
    test('galleryEntity.all test', () => {
        var all = galleryEntity.all();
        expect(all.length).toBe(2);

        expect(all[0].id).toBe(util.toBase64(testGalleryName1));
        expect(all[0].name).toBe(testGalleryName1);

        expect(all[1].id).toBe(util.toBase64(testGalleryName2));
        expect(all[1].name).toBe(testGalleryName2);
    });

    test('galleryEntity.create test', () => {
        var testGalleryName3 = "My Test Gallery3";
        galleryEntity.create(testGalleryName3);
        var all = galleryEntity.all();
        expect(all.length).toBe(3);

        expect(all[2].id).toBe(util.toBase64(testGalleryName3));
        expect(all[2].name).toBe(testGalleryName3);
    });

    test('galleryEntity.rename test', () => {
        var newGallery1Name = "NEW_NAME_" + testGalleryName1;
        galleryEntity.rename(util.toBase64(testGalleryName1), newGallery1Name);

        var all = galleryEntity.all();
        expect(all[1].id).toBe(util.toBase64(testGalleryName1));
        expect(all[1].name).toBe(newGallery1Name);
    });

    test('galleryEntity.clear test', () => {
        galleryEntity.clear();
        var all = galleryEntity.all();
        expect(all.length).toBe(0);
    });

    test('galleryEntity.delete test', () => {
        var gallery1Id = util.toBase64(testGalleryName1);
        var findGallery = galleryEntity.find(gallery1Id);

        galleryEntity.delete(findGallery);
        var all = galleryEntity.all();
        expect(all.length).toBe(1);
    });

    test('galleryEntity.find test', () => {
        var gallery1Id = util.toBase64(testGalleryName1);
        var findGallery = galleryEntity.find(gallery1Id);

        expect(findGallery.id).toBe(gallery1Id);
        expect(findGallery.name).toBe(testGalleryName1);
    });

    test('galleryEntity.search test', () => {
        var searchResults = galleryEntity.search("Test");
        expect(searchResults.length).toBe(2);

        var searchResults2 = galleryEntity.search("Gallery1");
        expect(searchResults2.length).toBe(1);

        var searchResults3 = galleryEntity.search("Gallery3");
        expect(searchResults3.length).toBe(0);
    });

    test('jsonResult.success test', () => {
        var successResult = jsonResult.success("OK", { extra: "extra data" });

        expect(successResult.msg).toBe("OK");
        expect(successResult.data).toBeDefined();
        expect(successResult.data.extra).toBe("extra data");
    });

    test('jsonResult.failed test', () => {
        var failedResult = jsonResult.failed(1, "error msg");

        expect(failedResult.code).toBe(1);
        expect(failedResult.msg).toBe("error msg");
    });

    test('photoEntity.getGalleryPhotos test', () => {
        var gallery1Id = util.toBase64(testGalleryName1);
        var photos = photoEntity.getGalleryPhotos(gallery1Id);
        expect(photos.length).toBe(1);
        expect(photos[0].file.indexOf(testFileName)).not.toBe(-1);
    });

    test('photoEntity.find test', () => {
        var gallery1Id = util.toBase64(testGalleryName1);
        var photoId = photoEntity.getGalleryPhotos(gallery1Id)[0].id;
        var photo = photoEntity.find(gallery1Id, photoId);
        expect(photo).not.toBeUndefined();
        expect(photo).not.toBe(-1);
        expect(photo.file.indexOf(testFileName)).not.toBe(-1);
    });

    test('photoEntity.search test', () => {
        var gallery1Id = util.toBase64(testGalleryName1);
        var searchResults = photoEntity.search(gallery1Id, "test");
        expect(searchResults.length).toBe(1);
        expect(searchResults[0].name).toBe(util.getFileNameWithoutExt(testFileName));

        var searchResults2 = photoEntity.search(gallery1Id, "test1");
        expect(searchResults2.length).toBe(0);
    });

    test('photoEntity.delete test', () => {
        var gallery1Id = util.toBase64(testGalleryName1);
        var photoId = photoEntity.getGalleryPhotos(gallery1Id)[0].id;

        photoEntity.delete(gallery1Id, photoId);

        var galleryPhotos = photoEntity.getGalleryPhotos(gallery1Id);
        expect(galleryPhotos.length).toBe(0);
    });

    test('photoEntity.rename test', () => {
        var gallery1Id = util.toBase64(testGalleryName1);
        var photoId = photoEntity.getGalleryPhotos(gallery1Id)[0].id;
        var newName = "NEW_NAME" + util.getFileNameWithoutExt(testFileName);

        photoEntity.rename(gallery1Id, photoId, newName);

        var photo = photoEntity.getGalleryPhotos(gallery1Id)[0];
        expect(photo.name).toBe(newName);
    });

    test('photoEntity.tag test', () => {
        var gallery1Id = util.toBase64(testGalleryName1);
        var photoId = photoEntity.getGalleryPhotos(gallery1Id)[0].id;

        //in test, file not exists, so return tags must be [], length is 0
        photoEntity.tag(gallery1Id, photoId).then((tags) => {
            expect(tags.length).toBe(0);
        });
    });

    test('userEntity.login test', () => {
        var user = userEntity.login("admin", "12345678");
        expect(user).not.toBeUndefined();

        user = userEntity.login("admin", "123456789");
        expect(user).toBeUndefined();
    });
});

describe("Test gallery api", () => {
    test("GET /api/gallery", () => {
        request.get('/api/gallery')
            .expect(200)
            .end((err, res) => {
                expect(res.body.data.length).toBe(2);
                expect(res.body.data[0].name).toBe(testGalleryName1);
                expect(res.body.data[1].name).toBe(testGalleryName2);
            });
    });

    test("GET /api/gallery/detail?id=" + galleryId1, () => {
        request.get('/api/gallery/detail')
            .query({ id: galleryId1 })
            .expect(200)
            .end((err, res) => {
                expect(res.body.data.name).toBe(testGalleryName1);
            });
    });

    test("GET /api/gallery/search?keywords=" + testGalleryName1, () => {
        request.get('/api/gallery/search')
            .query({ keywords: testGalleryName1 })
            .expect(200)
            .end((err, res) => {
                expect(res.body.data.length).toBe(1);
                expect(res.body.data[0].name).toBe(testGalleryName1);
            });
    });
});

describe("Test photo api", () => {
    test("GET /api/photo/detail?galleryId=" + galleryId1 + "&photoId=" + photoId, () => {
        request.get('/api/photo/detail')
            .query({ galleryId: galleryId1, photoId: photoId })
            .expect(200)
            .end((err, res) => {
                expect(res.body.data.id).toBe(photoId);
            });
    });

    var name = testFileName.substring(0, testFileName.lastIndexOf('.'));
    test("GET /api/photo/search?galleryId=" + galleryId1 + "&keywords=" + name, () => {
        request.get('/api/photo/search')
            .query({ galleryId: galleryId1, keywords: name })
            .expect(200)
            .end((err, res) => {
                expect(res.body.data.length).toBe(1);
                expect(res.body.data[0].name).toBe(name);
            });
    });
});

describe("Test user api", () => {
    test("GET /api/user/isUserLogined", () => {
        request.get('/api/user/isUserLogined')
            .expect(200)
            .end((err, res) => {
                expect(res.body.code).toBe(-1);
                expect(res.body.msg).toBe("No Authorization");
            });
    });
});