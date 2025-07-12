const Sprint = require("../models/Sprint");
const Project = require("../models/Project");
const { validationResult } = require("express-validator");

class SprintController {
  // Создание спринта
  async createSprint(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { name, startDate, endDate, project } = req.body;
      const userId = req.user.id;
      const isAdmin = req.user.roles.includes("ADMIN");

      const targetProject = await Project.findById(project);
      if (!targetProject) {
        return res.status(404).json({ message: "Проект не найден" });
      }

      if (
        !isAdmin &&
        targetProject.createdBy.toString() !== userId &&
        !targetProject.participants.includes(userId)
      ) {
        return res.status(403).json({ message: "Нет доступа к проекту" });
      }

      const sprint = new Sprint({
        name,
        startDate,
        endDate,
        project
      });

      await sprint.save();
      return res.status(201).json(sprint);
    } catch (e) {
      console.error("Create sprint error:", e);
      return res.status(500).json({ message: "Ошибка при создании спринта" });
    }
  }

  // Получить все спринты для проекта
  async getSprintsByProject(req, res) {
    try {
      const projectId = req.params.projectId;
      const userId = req.user.id;
      const isAdmin = req.user.roles.includes("ADMIN");

      const targetProject = await Project.findById(projectId);
      if (!targetProject) {
        return res.status(404).json({ message: "Проект не найден" });
      }

      if (
        !isAdmin &&
        targetProject.createdBy.toString() !== userId &&
        !targetProject.participants.includes(userId)
      ) {
        return res.status(403).json({ message: "Нет доступа к проекту" });
      }

      const sprints = await Sprint.find({ project: projectId });
      return res.json(sprints);
    } catch (e) {
      console.error("Get sprints error:", e);
      return res.status(500).json({ message: "Ошибка при получении спринтов" });
    }
  }

  // Получить один спринт по ID
  async getSprintById(req, res) {
    try {
      const sprint = await Sprint.findById(req.params.id);
      if (!sprint) {
        return res.status(404).json({ message: "Спринт не найден" });
      }

      const targetProject = await Project.findById(sprint.project);
      const userId = req.user.id;
      const isAdmin = req.user.roles.includes("ADMIN");

      if (
        !isAdmin &&
        targetProject.createdBy.toString() !== userId &&
        !targetProject.participants.includes(userId)
      ) {
        return res.status(403).json({ message: "Нет доступа к проекту" });
      }

      return res.json(sprint);
    } catch (e) {
      console.error("Get sprint by ID error:", e);
      return res.status(500).json({ message: "Ошибка при получении спринта" });
    }
  }

  // Обновление спринта
  async updateSprint(req, res) {
    try {
      const { name, startDate, endDate } = req.body;
      const sprint = await Sprint.findById(req.params.id);
      if (!sprint) {
        return res.status(404).json({ message: "Спринт не найден" });
      }

      const targetProject = await Project.findById(sprint.project);
      const userId = req.user.id;
      const isAdmin = req.user.roles.includes("ADMIN");

      if (
        !isAdmin &&
        targetProject.createdBy.toString() !== userId
      ) {
        return res.status(403).json({ message: "Нет прав на редактирование" });
      }

      if (name) sprint.name = name;
      if (startDate) sprint.startDate = startDate;
      if (endDate) sprint.endDate = endDate;

      await sprint.save();
      return res.json(sprint);
    } catch (e) {
      console.error("Update sprint error:", e);
      return res.status(500).json({ message: "Ошибка при обновлении спринта" });
    }
  }

  // Удаление спринта
  async deleteSprint(req, res) {
    try {
      const sprint = await Sprint.findById(req.params.id);
      if (!sprint) {
        return res.status(404).json({ message: "Спринт не найден" });
      }

      const targetProject = await Project.findById(sprint.project);
      const userId = req.user.id;
      const isAdmin = req.user.roles.includes("ADMIN");

      if (
        !isAdmin &&
        targetProject.createdBy.toString() !== userId
      ) {
        return res.status(403).json({ message: "Нет прав на удаление" });
      }

      await sprint.deleteOne();
      return res.json({ message: "Спринт удалён" });
    } catch (e) {
      console.error("Delete sprint error:", e);
      return res.status(500).json({ message: "Ошибка при удалении спринта" });
    }
  }
}

module.exports = new SprintController();
