const { createApplication,getApplications,getApplicationById,updateApplicationStatus,deleteApplication } = require('../controller/applications.controller');
const { authenticate, authorize } = require('../middleware/auth');
const router = require('express').Router();


router.get('/', authenticate, authorize('student','company'),getApplications);
router.get('/:id', authenticate, authorize('student','company'),getApplicationById);

router.post('/', authenticate, createApplication)
router.delete('/:id', authenticate, deleteApplication)

router.put('/:id', authenticate, authorize('company'),updateApplicationStatus)

module.exports = router;