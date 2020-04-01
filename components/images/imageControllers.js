require('dotenv').config()
const multer = require('multer')
const cloudinary = require('cloudinary')
const cloudinaryStorage = require('multer-storage-cloudinary')
const db = require('../../dbConfig')

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
})

const storage = cloudinaryStorage({
  cloudinary,
  folder: 'demo',
  allowedFormats: ['jpg', 'png', 'gif'],
})

const upload = multer({ storage }).single('profile_pic')

module.exports = {
  async uploadImg(req, res, next) {
    const user_id = req.user === undefined ? req.body.user : req.user.id
    upload(req, res, function(err) {
      if (err) {
        return new Error(err)
      }
      return db('users')
        .update('profile_picture', req.file.secure_url)
        .where('id', req.user.id)
        .returning('*')
        .then(response => {
          res.status(200).json({ success: 'added image', user: response[0] })
        })
        .catch(error => new Error(error))
    })
  },
  async uploadHeader(req, res, next) {
    upload(req, res, function(err) {
      if (err) {
        return new Error(err)
      }
      if (req.file.secure_url) {
        return db('users')
          .update('header_picture', req.file.secure_url)
          .where('id', req.user.id)
          .returning('*')
          .then(response => {
            res.status(200).json({ success: 'added image', user: response[0] })
          })
          .catch(error => new Error(error))
      }
      return res.status(200).json({ success: 'added image' })
    })
  },
  async getImg(req, res, next) {
    try {
      const user_id = req.user === undefined ? req.body.user_id : req.user.id
      const selectPromise = await db('users')
        .where({ id: user_id })
        .select('profile_picture')
      if (selectPromise) {
        return res.status(200).json(selectPromise)
      }
      return res.status(500).json({ msg: `user doesn't have an a image` })
    } catch (error) {
      return new Error(error)
    }
  },
}
