const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
const path    = require('path');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

require('./database');

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/students',   require('./routes/students'));
app.use('/api/attendance', require('./routes/attendance'));

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('🚀 Server running at http://localhost:' + PORT);
  console.log('🗄️  Database: SQLite (tgpcms.db)');
});