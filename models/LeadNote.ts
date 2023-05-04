import { Schema, model, models } from 'mongoose';

const leadNoteSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' }!,
  createdAt: { type: Date!, default: Date.now() },
  content: String!,
  revision: { type: Schema.Types.ObjectId, ref: 'LeadRevision' },
  leadChanges: [{ type: Schema.Types.ObjectId, ref: 'LeadChange' }],
  parentNote: { type: Schema.Types.ObjectId, ref: 'LeadNote' }
});

const LeadNote = models?.LeadNote || model('Client', leadNoteSchema);

export default LeadNote;