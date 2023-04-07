const jwt = require('jsonwebtoken')
const SECRET = "fdfhfjdfdjfdjerwrereresaassa2dd@ddds"
const sdb = require("stormdb");
const crpt = require('bcryptjs');

const express = require('express');
const router = express.Router();
const INVALID_STATUS = 403;
const COOKIE_TOKEN_NAME = 'jwt-token';

const createError = require('http-errors');


const fs = require("fs");
const path = require('path');

const resPath = path.join(path.resolve(__dirname, '..'), '/public/res/');
const userPath = resPath + "user.json";

router.retrieveDb = function () {
  // Use JSON file for storage
  const engine = new sdb.localFileEngine(userPath);
  const db = new sdb(engine);

  return db;
}
queryUser = function (req, username) {
  if (!username) return null;
  try {
    return req.userDb.get('users').get(username).value();
  } catch (err) {
    console.error('error occur loading username:' + username);
  }
  return null;
}
router.setSecretKey = function (key) {
  this.secrectKey = key;
}
router.get('/logout', function (req, res, next) {
  res.cookie(COOKIE_TOKEN_NAME, null);
  res.redirect("/login");
});
router.post('/login', function (req, res, next) {
  const username = req.body.username;
  const user = queryUser(req, username);
  if (!user) {
    return next(createError(INVALID_STATUS, '用户名不存在'));    
  }
  const isPasswordValid = crpt.compareSync(
    req.body.password,
    user.password
  )
  if (!isPasswordValid) {
    // 密码无效
    return next(createError(INVALID_STATUS, '密码无效'));
  }
  const token = jwt.sign({
    username: String(username)
  }, SECRET);

  // 设置90天过期
  res.cookie(COOKIE_TOKEN_NAME, token, { maxAge: 86400 * 90, httpOnly: true });
  res.redirect("/");
})

// 中间件：验证授权
const auth = async (req, res, next) => {
  if ('/login' == req.url) {
    next();
    return;
  }

  const loginUser = calcLoginUser(req);
  loginUser ? next() : next(createError(INVALID_STATUS, "没有访问权限（403）"));
  // loginUser ? next() : res.redirect('/login');
}

calcLoginUser = function (req) {
  var loginUser = null;
  const tokenFromCookies = req.cookies[COOKIE_TOKEN_NAME] || '';
  // 获取客户端cookies种的token
  const rawToken = String(tokenFromCookies.split(' ').pop());
  if (rawToken && rawToken != "undefined") {
    try {
      const tokenData = jwt.verify(rawToken, SECRET);
      // console.log(tokenData)
      // 获取用户id
      const username = tokenData.username;
      const user = queryUser(req, username);
      // invalid cookie, clear it before redirect
      if (!user)
        res.cookie(COOKIE_TOKEN_NAME, null);

      loginUser = {username: username, nickname: user.nickname};
    } catch (error) {
      console.error(error);
    }
  }
  return loginUser;
}

router.use(auth);

router.get("/", auth, function (req, res, next) {
  res.render('index', { title: 'Chess Ranking Application', loginUser: calcLoginUser(req) });
});
router.get("/login", auth, function (req, res, next) {
  res.render('login', { title: 'User Login', loginUser: calcLoginUser(req) });
});

module.exports = router;
