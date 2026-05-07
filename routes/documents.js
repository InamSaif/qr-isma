const express = require('express');
const router = express.Router();
const {
    getDocuments,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    expireDocument,
    verifyDocument,
    getPublicDocument
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/verify/:id', verifyDocument);
router.get('/public/:id', getPublicDocument);

// Protected routes
router.use(protect);

router.route('/')
    .get(getDocuments)
    .post(createDocument);

router.route('/:id')
    .get(getDocument)
    .put(updateDocument)
    .delete(deleteDocument);

router.put('/:id/expire', expireDocument);

module.exports = router;

