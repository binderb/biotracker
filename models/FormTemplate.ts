import { Schema, model, models } from 'mongoose';

const formTemplateSchema = new Schema({
  name: String!,
  formCategory: String!,
  formIndex: Number!,
  revisions: [{ type: Schema.Types.ObjectId, ref: 'FormTemplateRevision'}],
  metadata: String,
});

const FormTemplate = models?.FormTemplate || model('FormTemplate', formTemplateSchema);

export default FormTemplate;