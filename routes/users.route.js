const { GET,GETBYSKILL,GETBYID,POST,POSTLOGIN,PUT,DELETE } = require('../controller/users.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = require('express').Router();

router.post('/register',POST);
router.post('/login',POSTLOGIN);

router.get('/',authenticate,GET);
router.get('/skill/:skills',authenticate,GETBYSKILL);
router.get('/:id',authenticate,GETBYID);

router.put('/:id',authenticate,PUT);
router.delete('/:id',authenticate,DELETE);

module.exports = router;