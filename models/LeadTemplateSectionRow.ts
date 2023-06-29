import { Schema, model, models } from 'mongoose';

const leadTemplateSectionRowSchema = new Schema({
  index: Number!,
  fields: [{ type: Schema.Types.ObjectId, ref: 'LeadTemplateField'}]!,
  extensible: Boolean!,
});

const LeadTemplateSectionRow = models?.LeadTemplateSectionRow || model('LeadTemplateSectionRow', leadTemplateSectionRowSchema);

export default LeadTemplateSectionRow;