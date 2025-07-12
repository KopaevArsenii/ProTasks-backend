const Task = require("../models/Task");
const Project = require("../models/Project");
const Sprint = require("../models/Sprint");
const { validationResult } = require("express-validator");

class TaskController {
  // Создание задачи
  async createTask(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { title, description, status, priority, assignedTo, sprint, project } = req.body;
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

      if (sprint) {
        const targetSprint = await Sprint.findById(sprint);
        if (!targetSprint || targetSprint.project.toString() !== project) {
          return res.status(400).json({ message: "Некорректный спринт" });
        }
      }

      const task = new Task({
        title,
        description,
        status,
        priority,
        assignedTo,
        sprint,
        project,
        createdBy: userId
      });

      await task.save();
      return res.status(201).json(task);
    } catch (e) {
      console.error("Create task error:", e);
      return res.status(500).json({ message: "Ошибка при создании задачи" });
    }
  }

  // Получение всех задач проекта
  async getTasksByProject(req, res) {
    try {
      const { projectId } = req.params;
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

      const tasks = await Task.find({ project: projectId })
        .populate("assignedTo", "username")
        .populate("sprint", "name");

      return res.json(tasks);
    } catch (e) {
      console.error("Get tasks by project error:", e);
      return res.status(500).json({ message: "Ошибка при получении задач" });
    }
  }

  // Получение всех задач спринта
  async getTasksBySprint(req, res) {
    try {
      const { sprintId } = req.params;
      const userId = req.user.id;
      const isAdmin = req.user.roles.includes("ADMIN");

      const sprint = await Sprint.findById(sprintId);
      if (!sprint) {
        return res.status(404).json({ message: "Спринт не найден" });
      }

      const targetProject = await Project.findById(sprint.project);
      if (
        !isAdmin &&
        targetProject.createdBy.toString() !== userId &&
        !targetProject.participants.includes(userId)
      ) {
        return res.status(403).json({ message: "Нет доступа к проекту" });
      }

      const tasks = await Task.find({ sprint: sprintId })
        .populate("assignedTo", "username")
        .populate("project", "name");

      return res.json(tasks);
    } catch (e) {
      console.error("Get tasks by sprint error:", e);
      return res.status(500).json({ message: "Ошибка при получении задач спринта" });
    }
  }

  // Получение одной задачи
  async getTaskById(req, res) {
    try {
      const task = await Task.findById(req.params.id)
        .populate("assignedTo", "username")
        .populate("project", "name")
        .populate("sprint", "name");

      if (!task) {
        return res.status(404).json({ message: "Задача не найдена" });
      }

      const userId = req.user.id;
      const isAdmin = req.user.roles.includes("ADMIN");
      const targetProject = await Project.findById(task.project);

      if (
        !isAdmin &&
        targetProject.createdBy.toString() !== userId &&
        !targetProject.participants.includes(userId)
      ) {
        return res.status(403).json({ message: "Нет доступа к задаче" });
      }

      return res.json(task);
    } catch (e) {
      console.error("Get task by ID error:", e);
      return res.status(500).json({ message: "Ошибка при получении задачи" });
    }
  }

  // Обновление задачи
  async updateTask(req, res) {
    try {
      const { title, description, status, priority, assignedTo, sprint } = req.body;
      const task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).json({ message: "Задача не найдена" });
      }

      const targetProject = await Project.findById(task.project);
      const userId = req.user.id;
      const isAdmin = req.user.roles.includes("ADMIN");

      if (!isAdmin && targetProject.createdBy.toString() !== userId) {
        return res.status(403).json({ message: "Нет прав на редактирование задачи" });
      }

      if (title) task.title = title;
      if (description) task.description = description;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (Array.isArray(assignedTo)) task.assignedTo = assignedTo;
      if (sprint !== undefined) task.sprint = sprint;

      await task.save();
      return res.json(task);
    } catch (e) {
      console.error("Update task error:", e);
      return res.status(500).json({ message: "Ошибка при обновлении задачи" });
    }
  }

  // Удаление задачи
  async deleteTask(req, res) {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Задача не найдена" });
      }

      const targetProject = await Project.findById(task.project);
      const userId = req.user.id;
      const isAdmin = req.user.roles.includes("ADMIN");

      if (!isAdmin && targetProject.createdBy.toString() !== userId) {
        return res.status(403).json({ message: "Нет прав на удаление задачи" });
      }

      await task.deleteOne();
      return res.json({ message: "Задача удалена" });
    } catch (e) {
      console.error("Delete task error:", e);
      return res.status(500).json({ message: "Ошибка при удалении задачи" });
    }
  }
}

module.exports = new TaskController();
