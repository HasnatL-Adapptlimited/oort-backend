import express from 'express';
import { restMiddleware } from '../server/middlewares';
import download from './download';
import proxy from './proxy';
import upload from './upload';
import email from './email';
import fileUpload from 'express-fileupload';

const router = express.Router();
router.use(fileUpload());
router.use(restMiddleware);
router.use('/download', download);
router.use('/proxy', proxy);
router.use('/upload', upload);
router.use('/email', email);

export { router };
