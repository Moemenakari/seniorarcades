const db = require('./src/config/db.js');
try {
  const req = {};
  const res = {
    json: (data) => console.log('Success, keys:', Object.keys(data)),
    status: (code) => ({ json: (err) => console.error('Error status', code, err) })
  };
  require('./src/controllers/dashboard.controller.js').getDashboard(req, res);
} catch (e) {
  console.error('Crash:', e.message);
}
