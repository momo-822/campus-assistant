const express = require('express')
const router = express.Router()

const authRoutes = require('./auth')
const canteenRoutes = require('./canteen')
const tradeRoutes = require('./trade')
const lostFoundRoutes = require('./lostFound')
const scheduleRoutes = require('./schedule')
const favoriteRoutes = require('./favorite')
const homeworkRoutes = require('./homework')

router.use('/auth', authRoutes)
router.use('/canteen', canteenRoutes)
router.use('/trade', tradeRoutes)
router.use('/lost-found', lostFoundRoutes)
router.use('/schedule', scheduleRoutes)
router.use('/favorite', favoriteRoutes)
router.use('/homework', homeworkRoutes)

module.exports = router