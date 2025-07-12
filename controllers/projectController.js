const Project = require("../models/Project");
const { validationResult } = require("express-validator");

class ProjectController {
  // Создание проекта
  async createProject(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { name, description, participants } = req.body;
      const createdBy = req.user.id;

      const project = new Project({
        name,
        description,
        createdBy,
        participants: participants && participants.length ? participants : [createdBy]
      });

      await project.save();
      return res.status(201).json(project);
    } catch (e) {
      console.error("Create project error:", e);
      return res.status(500).json({ message: "Ошибка при создании проекта" });
    }
  }

  // Получение всех проектов, доступных пользователю
  async getProjects(req, res) {
    try {
      const userId = req.user.id;
      const userRoles = req.user.roles;

      const query = userRoles.includes("ADMIN")
        ? {} // админ получает всё
        : {
            $or: [
              { createdBy: userId },
              { participants: userId }
            ]
          };

      const projects = await Project.find(query).populate("participants", "username");
      return res.json(projects);
    } catch (e) {
      console.error("Get projects error:", e);
      return res.status(500).json({ message: "Ошибка при получении проектов" });
    }
  }

  // Получение одного проекта по ID
  async getProjectById(req, res) {
    try {
      const project = await Project.findById(req.params.id).populate("participants", "username");

      if (!project) {
        return res.status(404).json({ message: "Проект не найден" });
      }

      const userId = req.user.id;
      const isAdmin = req.user.roles.includes("ADMIN");

      if (
        !isAdmin &&
        project.createdBy.toString() !== userId &&
        !project.participants.includes(userId)
      ) {
        return res.status(403).json({ message: "Нет доступа к проекту" });
      }

      return res.json(project);
    } catch (e) {
      console.error("Get project by ID error:", e);
      return res.status(500).json({ message: "Ошибка при получении проекта" });
    }
  }

  // Обновление проекта
  async updateProject(req, res) {
    try {
      const { name, description, participants } = req.body;
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({ message: "Проект не найден" });
      }

      const userId = req.user.id;
      const isAdmin = req.user.roles.includes("ADMIN");

      if (!isAdmin && project.createdBy.toString() !== userId) {
        return res.status(403).json({ message: "Нет прав на изменение проекта" });
      }

      if (name) project.name = name;
      if (description) project.description = description;
      if (participants) project.participants = participants;

      await project.save();
      return res.json(project);
    } catch (e) {
      console.error("Update project error:", e);
      return res.status(500).json({ message: "Ошибка при обновлении проекта" });
    }
  }

  // Удаление проекта
  async deleteProject(req, res) {
    try {
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({ message: "Проект не найден" });
      }

      const userId = req.user.id;
      const isAdmin = req.user.roles.includes("ADMIN");

      if (!isAdmin && project.createdBy.toString() !== userId) {
        return res.status(403).json({ message: "Нет прав на удаление проекта" });
      }

      await project.deleteOne();
      return res.json({ message: "Проект удалён" });
    } catch (e) {
      console.error("Delete project error:", e);
      return res.status(500).json({ message: "Ошибка при удалении проекта" });
    }
  }
}

module.exports = new ProjectController();
