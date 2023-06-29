import { Schema, model, models } from 'mongoose';

const leadTemplateSectionSchema = new Schema({
  name: String!,
  index: Number!,
  rows: [{ type: Schema.Types.ObjectId, ref: 'LeadTemplateSectionRow'}]!,
  extensible: Boolean!,
});

const LeadTemplateSection = models?.LeadTemplateSection || model('LeadTemplateSection', leadTemplateSectionSchema);

export default LeadTemplateSection;