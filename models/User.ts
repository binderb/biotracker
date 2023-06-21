import { Schema, model, models } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema({
  first: String!,
  last: String!,
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minLength: [6, "Your password must be at least 6 characters long"],
    select: false, //dont send back password after request
  },
  role: {
    type: String,
    default: 'user',
    enum: {
      values: [
        'user',
        'admin',
        'dev',
        'inactive'
      ],
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

// ENCRYPTION 
userSchema.pre('save', async function(next){
  if(!this.isModified('password')){
    next();
  }
  this.password = await bcrypt.hash(this.password, 10)
  next();
});

userSchema.pre('findOneAndUpdate', async function(){
  const update = this.getUpdate() as {password: string};
  if (update.password) {
    const newPassword = await bcrypt.hash(update.password, 10);
    this.set({ password: newPassword });
  }
});

userSchema.methods.comparePassword = async function(enteredPassword:string){
  return await bcrypt.compare(enteredPassword, this.password)
}


export default models?.User || model('User', userSchema);