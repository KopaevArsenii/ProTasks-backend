const Router = require("express");
const router = new Router();
const controller = require("../controllers/sprintController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, controller.createSprint);
router.get("/project/:projectId", authMiddleware, controller.getSprintsByProject);
router.get("/:id", authMiddleware, controller.getSprintById);
router.put("/:id", authMiddleware, controller.updateSprint);
router.delete("/:id", authMiddleware, controller.deleteSprint);

module.exports = router;
