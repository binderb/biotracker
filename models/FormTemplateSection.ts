import { Schema, model, models } from 'mongoose';

const formTemplateSectionSchema = new Schema({
  name: String!,
  index: Number!,
  rows: [{ type: Schema.Types.ObjectId, ref: 'FormTemplateRow'}]!,
  extensible: Boolean!,
  extensibleReference: Number,
});

const FormTemplateSection = models?.FormTemplateSection || model('FormTemplateSection', formTemplateSectionSchema);

export default FormTemplateSection;