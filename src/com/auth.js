// const express = require("express");
const { OAuth2Client } = require('google-auth-library')
const User = require('../models/user')
const { isExpired } = require('./com')
const shortid = require('shortid')

const CLIENT_ID =
  '262093891154-hf96vasi6kntg3fd0ppie509knmhsagi.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID)

const auth = async (req, res, next) => {
  const logger = req.ctx.logger.addTags('auth')
  try {
    const token = req.headers['x-access-token']
    if (!token) {
      logger.info(req.headers)
      throw Error('Request has no token')
    }
    // logger.verbose('token:', token)

    let payload
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
      })
      payload = ticket.getPayload()
    } catch (e) {
      if (e.message.indexOf('Token used too late') >= 0) {
        let start = e.message.indexOf('{')
        let payloadstr = e.message.slice(start)
        payload = JSON.parse(payloadstr)
        if (isExpired(payload.exp * 1000)) {
          throw new Error('access token is expired over 1 month')
        } else {
          console.log('access token is expired but not over month')
        }
      } else {
        throw e
      }
    }

    const { iss, sub, email, given_name, picture, exp } = payload

    let user = await User.findOne({ tokenID: sub })

    if (user) {
      // 기존 회원인경우
      user.lastVisitedAt = Date.now()
      let output = await user.save()

      let { id, email, name, image } = output
      req.user = { id, email, name, image, exp }
    } else {
      // 신규 회원인 경우
      let user = new User()
      Object.assign(user, {
        id: shortid.generate(),
        authProvider: iss,
        tokenID: sub,
        email: email,
        name: given_name,
        image: picture,
        createdAt: Date.now(),
        lastVisitedAt: Date.now(),
      })

      let output = await user.save()
      let { id, name, image } = output
      req.user = { id, email: email, name, image, exp }
    }

    req.isLogin = true
    logger.verbose('토큰검증 성공')
    //console.log("req.originalUrl = " + req.originalUrl);
  } catch (e) {
    // console.log(e);
    logger.error('토큰검증실패', e)
    req.isLogin = false
  }

  next()
}

module.exports = auth
