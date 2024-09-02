import { Router } from 'express';
import AppController from '../controllers/AppController';
// import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const UsersController = require('../controllers/UsersController');

const router = Router();

// Utility routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// User creation route
router.post('/users', UsersController.postNew);
router.get('/users/me', UsersController.getMe);

// Authentication routes
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

// Add new endpoint
// router.post('/files', FilesController.postUpload);
router.post('/files', FilesController.postUpload);

module.exports = router;
// export default router;
