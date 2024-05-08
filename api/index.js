const express = require('express');
const { scrapeTwitterAccounts } = require('../collectors/getTweets');
const config = require('../config');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  const targetAccounts = config.targetAccounts;

  res.status(200).render('index', { targetAccounts });
});

app.get('/tweets', async (req, res) => {
  try {
    await scrapeTwitterAccounts(config);
    res.status(200).send('Veri çekme işlemi tamamlandı.');
  } catch (error) {
    console.error('Veri çekme işlemi başarısız oldu:', error);
    res.status(500).send('Veri çekme işlemi başarısız oldu.');
  }
});

app.listen(PORT, () => {
  console.log(`${PORT} portunda server başaltıldı. Ctrl + Click yap: http://localhost:3000/`);
});