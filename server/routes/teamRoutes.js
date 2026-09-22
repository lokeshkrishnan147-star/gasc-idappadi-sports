const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { verifyToken, requireAdmin, requireStudent } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', teamController.getAllTeams);
router.get('/my-teams', verifyToken, requireStudent, teamController.getMyTeams);
router.get('/:id', teamController.getTeamById);

router.post('/', verifyToken, requireAdmin, upload.single('logo'), teamController.createTeam);
router.put('/:id', verifyToken, requireAdmin, upload.single('logo'), teamController.updateTeam);
router.delete('/:id', verifyToken, requireAdmin, teamController.deleteTeam);

module.exports = router;
