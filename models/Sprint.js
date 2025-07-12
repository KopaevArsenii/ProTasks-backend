const { Schema, model, Types } = require("mongoose");

const SprintSchema = new Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  project: { type: Types.ObjectId, ref: 'Project', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = model("Sprint", SprintSchema);
