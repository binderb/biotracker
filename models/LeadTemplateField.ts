import { Schema, model, models } from 'mongoose';

const leadTemplateFieldSchema = new Schema({
  name: String!,
  index: Number!,
  type: {
    type: String!,
    enum: ['textarea', 'multitextarea', 'input', 'multiinput', 'checkbox', 'multicheckbox'],
    default: 'textarea'
  },
  data: String,
  extensible: Boolean!,
});

const LeadTemplateField = models?.LeadTemplateField || model('LeadTemplateField', leadTemplateFieldSchema);

export default LeadTemplateField;