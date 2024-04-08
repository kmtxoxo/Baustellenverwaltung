const express = require('express');
const router = express.Router();

/** File imports */
let indexRouter = require('../routes/index');
//let productRouter = require('../routes/product');
let worktimeRouter = require('../routes/worktime');
let userRouter = require('../routes/user');
let accountRouter = require('../routes/account');
let constructionSiteRouter = require('../routes/constructionSite');
let materialRouter = require('../routes/material');
let noteRouter = require('../routes/note');
let notificationRouter = require('../routes/notification');
let taskRouter = require('../routes/task');
let permissionRouter = require('../routes/permission');

/** Routes */
router.use('/',indexRouter);
router.use('/', worktimeRouter);
router.use('/', userRouter);
router.use('/', accountRouter);
router.use('/', constructionSiteRouter);
router.use('/', materialRouter);
router.use('/', noteRouter);
router.use('/', notificationRouter);
router.use('/', taskRouter);
router.use('/', permissionRouter);

/** Exports */
module.exports = {router};
