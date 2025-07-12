const { Schema, model, Types } = require("mongoose");

const TaskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ["todo", "in progress", "review", "done"],
    default: "todo"
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium"
  },
  assignedTo: [{ type: Types.ObjectId, ref: 'User' }], // 🔥 Массив юзеров
  sprint: { type: Types.ObjectId, ref: 'Sprint' },
  project: { type: Types.ObjectId, ref: 'Project', required: true },
  createdBy: { type: Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

TaskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = model("Task", TaskSchema);
