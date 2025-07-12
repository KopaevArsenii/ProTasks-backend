const { Schema, model, Types } = require("mongoose");

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdBy: { type: Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: Types.ObjectId, ref: 'User' }], // Кто может видеть проект
  createdAt: { type: Date, default: Date.now }
});

module.exports = model("Project", ProjectSchema);
