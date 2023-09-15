/* eslint-disable @typescript-eslint/no-var-requires */
const express = require('express')
const router = express.Router()

const {
  processInbound,
  processOutbound
} = require('../controllers/sms.controller')

router.route('/inbound/sms').post(processInbound)
router.route('/outbound/sms').post(processOutbound)

module.exports = router
