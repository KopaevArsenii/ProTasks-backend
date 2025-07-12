const Router = require("express");
const router = new Router();
const controller = require("../controllers/projectController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, controller.createProject);
router.get("/", authMiddleware, controller.getProjects);
router.get("/:id", authMiddleware, controller.getProjectById);
router.put("/:id", authMiddleware, controller.updateProject);
router.delete("/:id", authMiddleware, controller.deleteProject);

module.exports = router;
