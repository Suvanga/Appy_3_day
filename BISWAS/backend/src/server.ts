import app from './app';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5002;
//Trigerring ec2 instance one more time 
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
 