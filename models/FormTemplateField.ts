import { Schema, model, models } from 'mongoose';

const formTemplateFieldSchema = new Schema({
  index: Number!,
  type: {
    type: String!,
    enum: ['label', 'textarea', 'multitextarea', 'input', 'multiinput', 'checkbox', 'multicheckbox','date'],
    default: 'textarea'
  },
  params: [String],
  data: [String],
});

const FormTemplateField = models?.FormTemplateField || model('FormTemplateField', formTemplateFieldSchema);

export default FormTemplateField;