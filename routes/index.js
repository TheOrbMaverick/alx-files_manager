const { Router } = require('express');
const AppController = require('../controllers/AppController')
const AuthController = require('../controllers/AuthController')
const FilesController = require('../controllers/FilesController')
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
router.post('/files', FilesController.postUpload);

export default router;
