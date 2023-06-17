import { Schema, model, models } from 'mongoose';

const inventorySpecSchema = new Schema({
  pn: {
    type: String!,
    unique: true
  },
  name: String!,
  shortName: String,
  description: String,
  status: {
    type: String!,
    enum: ['active','inactive','discontinued'],
    default: 'active'
  },
  link: String,
  catalog: String,
  cost: Number,
  shelfLife: Number,
  amount: Number!,
  units: {
    type: String!,
    enum: ['g','mg','ug','L','mL','uL','ct'],
    default: 'g'
  },
  threshold: Number!,
  category: { type: Schema.Types.ObjectId, ref: 'InventoryCategory' },
  vendor: { type: Schema.Types.ObjectId, ref: 'InventoryVendor' },
  logs: [{ type: Schema.Types.ObjectId, ref: 'InventoryLogEntry' }]!
});

const InventorySpec = models?.InventorySpec || model('InventorySpec', inventorySpecSchema);

export default InventorySpec;