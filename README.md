# MyGallery Project

## Introduction

The MyGallery project is a powerful local storage gallery site,
it use the local json data file save data, and local folder struction
save photos.

First to use this website, you need login first, then click create gallery
button create gallery, then you can upload pictures to gallery.

This site provided create gallery, rename gallery, delete gallery, and
auto tagging photo （remote API ）and so on.

## How to use

npm start: start node app
						At localhost:3000
npm run lint : pretest

npm test : jest

cloud : https://mygallerys.eu-gb.mybluemix.net

Enjoy it.

## How to use the site

For viewer:

search - search gallerys
detail - open gallerys
view - view full pictures
tagging - This remote API can work autotagging via ML when u view full pictures


For admin(the artist who owned this site ):

Login - userName: admin
				pw:12345678


Create: add gallery

Delete: delete gallerys

Rename: edit Name of

upload : upload 





## MyGallery Project API

#### Gallery

- [GET /api/gallery](#/api/gallery)
- [GET /api/gallery/detail](#/api/gallery/detail)
- [GET /api/gallery/search](#/api/gallery/search)
- [POST /api/gallery/create](#/api/gallery/create)
- [POST /api/gallery/rename](#/api/gallery/rename)
- [POST /api/gallery/delete](#/api/gallery/delete)
- [POST /api/gallery/upload](#/api/gallery/upload)

#### Photo

- [GET /api/photo/detail](#/api/photo/detail)
- [GET /api/photo/search](#/api/photo/search)
- [GET /api/photo/tag](#/api/photo/tag)
- [POST /api/photo/rename](#/api/photo/rename)
- [POST /api/photo/delete](#/api/photo/delete)

#### User

- [GET /api/user/isUserLogined](#/api/user/isUserLogined)
- [POST /user/login](#/api/user/login)
- [POST /user/logout](#/api/user/logout)

#### Api Response Structure

Response is an json object, like this:
```
{
	"code": 0,
	"msg": "OK",
	"data": { } || [] || null
}
```

<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>code</td>
            <td>number</td>
            <td>true</td>
            <td>reponse code.</td>
        </tr>
        <tr>
            <td>msg</td>
            <td>string</td>
            <td>true</td>
            <td>reponse message.</td>
        </tr>
        <tr>
            <td>data</td>
            <td>object|array|null</td>
            <td>false</td>
            <td>extra data</td>
        </tr>
    </tbody>
</table>

#### Api Response Structure Code Map

<table>
    <thead>
        <tr>
            <th>Code</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>0</td>
            <td>success response</td>
        </tr>
        <tr>
            <td>-1</td>
            <td>auth failed</td>
        </tr>
        <tr>
            <td>-2</td>
            <td>login failed, like username or password error</td>
        </tr>
        <tr>
            <td>-3</td>
            <td>request parameter missing or invalid</td>
        </tr>
        <tr>
            <td>-4</td>
            <td>server logic error</td>
        </tr>
    </tbody>
</table>

#### <a name="#/api/gallery">GET /api/gallery</a>

This api will return all gallerys info in json data file, default json file path is `./configs/gallery.json`

##### Parameters
<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="4">None</td>
        </tr>
    </tbody>
</table>

##### Response
*Success Response:*

```
{
	"code": 0,
	"msg": "OK",
	"data": [
	{
		"id": "TXkgVGVzdCBHYWxsZXJ5MQ==",
		"name": "My Test Gallery1",
		"count": 1,
		"cover": {
			"id": "dGVzdGZpbGUucG5n",
			"name": "testfile",
			"file": "\\uploadfiles\\My Test Gallery1\\testfile.png",
			"url": "/My Test Gallery1/testfile.png",
			"time": 1554291451511
		}
	},
	{
		"id": "TXkgVGVzdCBHYWxsZXJ5Mg==",
		"name": "My Test Gallery2",
		"count": 0
	}]
}
```

*Error Response:*
```
No error response
```


#### <a name="#/api/gallery/detail">GET /api/gallery/detail</a>

Get gallery detail api by gallery id.

Important: **Gallery id** is gallery name encrypted by base64

##### Parameters
<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>id</td>
            <td>string</td>
            <td>true</td>
            <td>gallery id</td>
        </tr>
    </tbody>
</table>

##### Response
*Success Response:*

```
{
	"code": 0,
	"msg": "OK",
	"data": {
		"id": "TXkgVGVzdCBHYWxsZXJ5MQ==",
		"name": "My Test Gallery1",
		"count": 1,
		"cover": {
			"id": "dGVzdGZpbGUucG5n",
			"name": "testfile",
			"file": "\\uploadfiles\\My Test Gallery1\\testfile.png",
			"url": "/My Test Gallery1/testfile.png",
			"time": 1554291451511
		},
		"photos": [{
			"id": "dGVzdGZpbGUucG5n",
			"name": "testfile",
			"file": "\\uploadfiles\\My Test Gallery1\\testfile.png",
			"url": "/My Test Gallery1/testfile.png",
			"time": 1554291451511
		}]
	}
}
```

*Error Response:*
```
{
	code: -4,
	msg: "Gallery with id xxx not exists!"
}
```


#### <a name="#/api/gallery/search">GET /api/gallery/search</a>

Search gallery by gallery name.

##### Parameters
<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>keywords</td>
            <td>string</td>
            <td>true</td>
            <td>search keywords</td>
        </tr>
    </tbody>
</table>

##### Response
*Success Response:*

```
{
	"code": 0,
	"msg": "OK",
	"data": [{
		"id": "TXkgVGVzdCBHYWxsZXJ5MQ==",
		"name": "My Test Gallery1",
		"count": 1,
		"cover": {
			"id": "dGVzdGZpbGUucG5n",
			"name": "testfile",
			"file": "\\uploadfiles\\My Test Gallery1\\testfile.png",
			"url": "/My Test Gallery1/testfile.png",
			"time": 1554291451511
		}
	}, {
		"id": "TXkgVGVzdCBHYWxsZXJ5Mg==",
		"name": "My Test Gallery2",
		"count": 0
	}]
}
```

*Error Response:*
```
{
	code: -3,
	msg: "Missing keywords parameter."
}
```

#### <a name="#/api/gallery/create">POST /api/gallery/create</a>

Create gallery, user just need post gallery name.

##### Parameters
<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>galleryName</td>
            <td>string</td>
            <td>true</td>
            <td>gallery name</td>
        </tr>
    </tbody>
</table>

##### Response
*Success Response:*

```
{
	"code": 0,
	"msg": "OK",
	"data": {
		"id": "QmFiaWVz",
		"name": "Babies"
	}
}
```

*Error Response:*

```
{
	code: -4,
	msg: "error message description"
}
```

#### <a name="#/api/gallery/rename">POST /api/gallery/rename</a>


Rename gallery, because this project use the local data store, so rename operation willl rename upload floder name, and all inner photos path.

##### Parameters
<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>galleryId</td>
            <td>string</td>
            <td>true</td>
            <td>gallery id</td>
        </tr>
        <tr>
            <td>newName</td>
            <td>string</td>
            <td>true</td>
            <td>new name</td>
        </tr>
    </tbody>
</table>

##### Response
*Success Response:*

```
{
	"code": 0,
	"msg": "OK",
	"data": {
		"id": "YWJiYg==",
		"name": "werr",
		"count": 0
	}
}
```

*Error Response:*

```
{
	code: -4,
	msg: "error message description"
}
```

#### <a name="#/api/gallery/delete">POST /api/gallery/delete</a>

Delete gallery by gallery id

##### Parameters
<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>id</td>
            <td>string</td>
            <td>true</td>
            <td>gallery id</td>
        </tr>
    </tbody>
</table>

##### Response
*Success Response:*

```
{
	"code": 0,
	"msg": "OK",
	"data": {
		"id": "YWJiYg==",
		"name": "acee",
		"count": 0
	}
}
```

*Error Response:*

```
{
	code: -4,
	msg: "Cannot read property 'name' of undefined"
}
```

#### <a name="#/api/gallery/upload">POST /api/gallery/upload</a>

Upload photo to gallery.

##### Parameters
<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>pictures</td>
            <td>file</td>
            <td>true</td>
            <td>picture file</td>
        </tr>
        <tr>
            <td>galleryName</td>
            <td>string</td>
            <td>true</td>
            <td>gallery name</td>
        </tr>
    </tbody>
</table>

##### Response
*Success Response:*

```
{
	"code": 0,
	"msg": "Upload file success.",
	"data": "/Babies/boy.png"
}
```

*Error Response:*

```
{
	code: -4,
	msg: "Gallery not exists"
}
```

#### <a name="#/api/photo/detail">GET /api/photo/detail</a>

Get photo detail by galleryId and photoId

##### Parameters
<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>galleryId</td>
            <td>string</td>
            <td>true</td>
            <td>gallery id</td>
        </tr>
        <tr>
            <td>photoId</td>
            <td>string</td>
            <td>true</td>
            <td>photo id</td>
        </tr>
    </tbody>
</table>

##### Response
*Success Response:*

```
{
	"code": 0,
	"msg": "OK",
	"data": {
		"id": "Ym95LnBuZw==",
		"name": "boy",
		"file": "\\uploadfiles\\Babies\\boy.png",
		"url": "/Babies/boy.png",
		"time": 1554303204057
	}
}
```

*Error Response:*
```
{
	code: -4,
	msg: "Photo [QmFiaWVz/Ym95LnBuZw==22] not exists!"
}
```

#### <a name="#/api/photo/search">GET /api/photo/search</a>


Search photo by galleryId and keywords.

##### Parameters
<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>galleryId</td>
            <td>string</td>
            <td>true</td>
            <td>gallery id</td>
        </tr>
        <tr>
            <td>keywords</td>
            <td>string</td>
            <td>true</td>
            <td>photo name</td>
        </tr>
    </tbody>
</table>

##### Response
*Success Response:*

```
{
	"code": 0,
	"msg": "OK",
	"data": [{
		"id": "Ym95LnBuZw==",
		"name": "boy",
		"file": "\\uploadfiles\\Babies\\boy.png",
		"url": "/Babies/boy.png",
		"time": 1554303204057
	}]
}
```

*Error Response:*
```
{
	code: 0,
	msg: "OK",
	data: [ ]
}
```

#### <a name="#/api/photo/tag">GET /api/photo/tag</a>

Use remote api auto tagging photo, in backend filter 5 tags.

##### Parameters
<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>galleryId</td>
            <td>string</td>
            <td>true</td>
            <td>gallery id</td>
        </tr>
        <tr>
            <td>photoId</td>
            <td>string</td>
            <td>true</td>
            <td>photo id</td>
        </tr>
    </tbody>
</table>

##### Response
*Success Response:*

```
{
	"code": 0,
	"msg": "OK",
	"data": ["attractive", "pretty", "cover girl", "smasher", "adult"]
}
```

*Error Response:*
```
{
	code: 0,
	msg: "OK",
	data: [ ]
}
```


#### <a name="#/api/photo/rename">POST /api/photo/rename</a>


Rename photo by galleryId, photoId and newName.

##### Parameters
<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>galleryId</td>
            <td>string</td>
            <td>true</td>
            <td>gallery id</td>
        </tr>
        <tr>
            <td>photoId</td>
            <td>string</td>
            <td>true</td>
            <td>photo id</td>
        </tr>
        <tr>
            <td>newName</td>
            <td>string</td>
            <td>true</td>
            <td>new name</td>
        </tr>
    </tbody>
</table>

##### Response
*Success Response:*

```
{
    "code": 0,
    "msg": "OK",
    "data": {
        "id": "MDdiMDIuanBn",
        "name": "my girls",
        "file": "\\uploadfiles\\Babies\\07b02.jpg",
        "url": "/Babies/07b02.jpg",
        "time": 1554303772455
    }
}
```

*Error Response:*

```
{
	"code": -4,
	"msg": "Can't rename photo, newName unavailable."
}
```

#### <a name="#/api/photo/delete">POST /api/photo/delete</a>

Delete photo by galleryId and photoId

##### Parameters
<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>galleryId</td>
            <td>string</td>
            <td>true</td>
            <td>gallery id</td>
        </tr>
        <tr>
            <td>photoId</td>
            <td>string</td>
            <td>true</td>
            <td>photo id</td>
        </tr>
    </tbody>
</table>

##### Response
*Success Response:*

```
{
	"code": 0,
	"msg": "OK",
	"data": {
		"id": "Ym95LnBuZw==",
		"name": "boy",
		"file": "\\uploadfiles\\Babies\\boy.png",
		"url": "/Babies/boy.png",
		"time": 1554303204057
	}
}
```

*Error Response:*

```
{
	"code": -4,
	"msg": "Can't delete photo, photo acee not exists!"
}
```


#### <a name="#/api/user/isUserLogined">GET /api/user/isUserLogined</a>

Check user is login or not, will return current login user name in data field

##### Parameters
<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="4">None</td>
        </tr>
    </tbody>
</table>

##### Response
*Success Response:*

```
{
	"code": 0,
	"msg": "OK",
	"data": "admin"
}
```

*Error Response:*

```
{
	"code": -1,
	"msg": "No Authorization"
}
```

#### <a name="#/api/user/login">POST /user/login</a>


User login api. user data will staticly store at `configs/admin.js`

##### Parameters
<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>userName</td>
            <td>string</td>
            <td>true</td>
            <td>user name</td>
        </tr>
        <tr>
            <td>password</td>
            <td>string</td>
            <td>true</td>
            <td>user password</td>
        </tr>
    </tbody>
</table>

##### Response
*Success Response:*

```
{
    "code": 0,
    "msg": "Login success!",
    "data": null
}
```

*Error Response:*

```
{
	"code": -2,
	"msg": "User name or password cannot be blank."
}
```

#### <a name="#/api/user/logout">POST /user/logout</a>

User logout api, will clear login session and redirect to home page.

##### Parameters
<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="4">None</td>
        </tr>
    </tbody>
</table>

##### Response
*Success Response:*

```
Auto redirect to home page
```

*Error Response:*

```
None
```
