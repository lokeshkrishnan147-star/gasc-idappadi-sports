const express = require('express');
const router = express.Router();
const competitionController = require('../controllers/competitionController');
const { verifyToken, requireAdmin, requireStudent } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', competitionController.getAllCompetitions);
router.get('/registrations/all', verifyToken, requireAdmin, competitionController.getAllRegistrations);
router.get('/my-applications', verifyToken, requireStudent, competitionController.getMyRegistrations);
router.get('/:id', competitionController.getCompetitionById);

router.post('/', verifyToken, requireAdmin, upload.single('bannerImage'), competitionController.createCompetition);
router.put('/:id', verifyToken, requireAdmin, upload.single('bannerImage'), competitionController.updateCompetition);
router.delete('/:id', verifyToken, requireAdmin, competitionController.deleteCompetition);

router.post('/:id/register', verifyToken, requireStudent, competitionController.registerForCompetition);
router.patch('/registrations/:id/status', verifyToken, requireAdmin, competitionController.updateRegistrationStatus);

module.exports = router;
