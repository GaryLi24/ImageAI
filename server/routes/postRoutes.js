import express from 'express'
import * as dotenv from 'dotenv'
import { v2 as cloudinary } from 'cloudinary'
import OSS from 'ali-oss'

import Post from '../mongodb/models/post.js'

dotenv.config()

const router = express.Router()

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_CLOUD_KEY,
//   api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
// })

// get all posts
router.route('/').get(async (req, res) => {
  try {
    const posts = await Post.find({})

    res.status(200).json({ success: true, data: posts })
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: 'Fetching posts failed, please try again！',
      })
  }
})

// create a post
router.route('/').post(async (req, res) => {
  try {
    const { name, prompt, photo } = req.body

    const client = new OSS({
      region: process.env.ALI_OSS_REGION,
      accessKeyId: process.env.ALI_OSS_ID,
      accessKeySecret: process.env.ALI_OSS_SECRET,
      bucket: process.env.ALI_OSS_BUCKET,
    })
    // photo //data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAkGBwgHBgkIBwgKCgkLDR......
    let str = photo.split(',')
    let suffix = photo.split(';')[0].split('/')[1]

    let buffer = Buffer.from(str[1], 'base64')
    let imgKey = `garyli/${new Date().getTime()}.` + suffix
    let imgUrl
    await client.put(imgKey, buffer).then(async pic => {
      imgUrl = pic.url
    })
    const newPost = await Post.create({
      name,
      prompt,
      photo: imgUrl,
    })

    res.status(200).json({ success: true, data: newPost })

    // const photoUrl = await cloudinary.uploader.upload(photo)
    // const newPost = await Post.create({
    //   name,
    //   prompt,
    //   photo: photoUrl.url,
    // })

    // res.status(201).json({ success: true, data: newPost })
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: 'Unable to create a post, please try again',
    })
  }
})

export default router
