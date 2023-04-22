import { Schema, model, models } from 'mongoose';

const studySchema = new Schema({
  index: Number!,
  type: String!,
});

const Study = models?.Study || model('Study', studySchema);

export default Study;