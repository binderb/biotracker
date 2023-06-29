import { Schema, model, models } from 'mongoose';

const leadTemplateFieldSchema = new Schema({
  index: Number!,
  type: {
    type: String!,
    enum: ['label', 'textarea', 'multitextarea', 'input', 'multiinput', 'checkbox', 'multicheckbox'],
    default: 'textarea'
  },
  params: [String],
  data: [String],
});

const LeadTemplateField = models?.LeadTemplateField || model('LeadTemplateField', leadTemplateFieldSchema);

export default LeadTemplateField;