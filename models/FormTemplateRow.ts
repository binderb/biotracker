import { Schema, model, models } from 'mongoose';

const formTemplateRowSchema = new Schema({
  index: Number!,
  fields: [{ type: Schema.Types.ObjectId, ref: 'FormTemplateField'}]!,
  extensible: Boolean!,
  extensibleReference: Number,
});

const FormTemplateRow = models?.FormTemplateRow || model('FormTemplateRow', formTemplateRowSchema);

export default FormTemplateRow;