import User from '../../../../models/User';
import connectMongo from '../../../../utils/connectMongo';
import handler from '../../../../utils/authHandler';
import { NextApiRequest, NextApiResponse } from 'next'



handler
  .post(createUser)

async function createUser(req:NextApiRequest, res:NextApiResponse) {

  await connectMongo();

  const user = await User.create(req.body);

  res.status(201).json({ message: 'Created user!' });

}

export default handler;