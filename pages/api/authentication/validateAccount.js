import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password, username } = req.body;
    console.error('the email received is: ' + email);

    // Check if email or password is missing
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      console.error('before');
      const user = await prisma.user.findUnique({
        where: { email: email },
      });
      console.error('after');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // compare the elements.
      if (username == user.name && email == user.email && password == user.password) {
        return res.status(200).json({
        message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            notes: user.notes,
          },
        });
      } else {
        return res.status(401).json({ message: 'Incorrect username, email, or password.' });
      };

    } catch (error) {
      console.log("Error:", error.stack);
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}