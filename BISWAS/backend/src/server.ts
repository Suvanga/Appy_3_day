import app from './app';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5002;
//New Instance launch with a github/workflows trigger 

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
 