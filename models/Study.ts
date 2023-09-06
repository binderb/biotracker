import { Schema, model, models } from 'mongoose';

const studySchema = new Schema({
  client: { type: Schema.Types.ObjectId, ref: 'Client' }!,
  index: Number!,
  type: String!,
  leadId: { type: Schema.Types.ObjectId, ref: 'Lead' }!
});

const Study = models?.Study || model('Study', studySchema);

export default Study;