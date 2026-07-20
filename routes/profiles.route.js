const {createProfile,getProfileByUserId,updateProfile,GET} = require('../controller/profiles.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = require('express').Router();

router.patch('/',authenticate,updateProfile);
router.get('/',authenticate,GET)
router.get('/:id',authenticate,getProfileByUserId);
router.post('/',authenticate,createProfile)


module.exports = router;
