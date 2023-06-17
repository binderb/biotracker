import { Schema, model, models } from 'mongoose';

const inventoryItemSchema = new Schema({
  lot: String!,
  status: {
    type: String!,
    enum: ['unopened', 'opened', 'empty'],
    default: 'unopened'
  },
  boxgridX: String,
  boxgridY: String,
  received: Date,
  currentAmount: Number!,
  spec: { type: Schema.Types.ObjectId, ref: 'InventorySpec' }!,
  location: { type: Schema.Types.ObjectId, ref: 'InventoryLocation' }!,
  logs: [{ type: Schema.Types.ObjectId, ref: 'InventoryLogEntry' }]!
});

const InventoryItem = models?.InventoryItem || model('InventoryItem', inventoryItemSchema);

export default InventoryItem;