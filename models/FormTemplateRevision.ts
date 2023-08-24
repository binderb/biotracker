import { Schema, model, models } from 'mongoose';

const formTemplateRevisionSchema = new Schema({
  createdAt: Date!,
  note: String!,
  sections: [{ type: Schema.Types.ObjectId, ref: 'FormTemplateSection'}]!,
});

const FormTemplateRevision = models?.FormTemplateRevision || model('FormTemplateRevision', formTemplateRevisionSchema);

export default FormTemplateRevision;