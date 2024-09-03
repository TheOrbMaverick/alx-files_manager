// import { Router } from 'express';
// import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const express = require('express');
const router = express.Router();
const AppController = require('../controllers/AppController');


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
