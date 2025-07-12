const Router = require("express");
const router = new Router();
const controller = require("../controllers/TaskController");
const authMiddleware = require("../middleware/authMiddleware");
const { check } = require("express-validator");

router.post(
  "/",
  authMiddleware,
  [
    check("title", "Название задачи обязательно").notEmpty(),
    check("project", "Проект обязателен").notEmpty(),
  ],
  controller.createTask
);

router.get("/project/:projectId", authMiddleware, controller.getTasksByProject);
router.get("/sprint/:sprintId", authMiddleware, controller.getTasksBySprint);
router.get("/:id", authMiddleware, controller.getTaskById);
router.put("/:id", authMiddleware, controller.updateTask);
router.delete("/:id", authMiddleware, controller.deleteTask);

module.exports = router;
