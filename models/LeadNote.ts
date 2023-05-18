import { Schema, model, models } from 'mongoose';

const leadNoteSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' }!,
  createdAt: Date!,
  content: String!,
  newRevision: Boolean!,
  revision: { type: Schema.Types.ObjectId, ref: 'LeadRevision' },
  leadChanges: [{ type: Schema.Types.ObjectId, ref: 'LeadChange' }],
  parentNote: { type: Schema.Types.ObjectId, ref: 'LeadNote' }
});

const LeadNote = models?.LeadNote || model('LeadNote', leadNoteSchema);

export default LeadNote;