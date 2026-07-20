const { GET,GETBYID,POST,DELETE } = require('../controller/jobs.controller');
const { authenticate, authorize } = require('../middleware/auth');
const router = require('express').Router();


router.get('/',GET);
router.get('/:id',GETBYID);
router.post('/', authenticate,authorize('company'),POST)
router.delete('/:id', authenticate,authorize('company'),DELETE)

module.exports = router;
