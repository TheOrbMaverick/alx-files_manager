import { Router } from 'express';
import AppController from '../controllers/AppController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';
import UsersController from '../controllers/UsersController';

const router = Router();

// Utility routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// User creation route
router.post('/users', UsersController.postNew);

router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);

// File controller routes
router.post('/files', FilesController.postUpload);

export default router;
