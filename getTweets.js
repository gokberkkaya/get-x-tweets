const { Builder, By, Key, until } = require('selenium-webdriver');
const { writeFile } = require('fs').promises;

const config = {
  twitter: {
    username: 'xxx', // dummy x account username
    password: 'xxx', // dummy x account password
  },
  scrape: {
    targetAccount: 'kygokberk', // which account's tweets do you want (username) ?
  },
};

async function scrapeTwitterAccount(config) {
  const driver = await new Builder().forBrowser('chrome').build();

  try {
    await driver.get('https://x.com/login');

    // Kullanıcı adı veya e-posta giriş kutusunu bekle
    await driver.wait(until.elementLocated(By.css('input[autocomplete="username"]')), 10000);

    // Kullanıcı adı veya e-posta giriş kutusuna yaz
    await driver.findElement(By.css('input[autocomplete="username"]')).sendKeys(config.twitter.username);

    // 2 saniye bekle
    await driver.sleep(2000);

    // "İleri" yazısına sahip span elementine tıkla
    await driver.findElement(By.xpath("//span[contains(text(), 'İleri')]")).click();

    // Şifre giriş kutusunu bekle
    await driver.wait(until.elementLocated(By.name('password')), 10000);

    // Şifre giriş kutusuna yaz
    await driver.findElement(By.name('password')).sendKeys(config.twitter.password);

    // 2 saniye bekle
    await driver.sleep(2000);

    // Giriş yap butonuna tıkla
    await driver.findElement(By.css('div[data-testid="LoginForm_Login_Button"]')).click();

    await driver.sleep(10000);

    // Hedef hesabın sayfasına git
    await driver.get(`https://x.com/${config.scrape.targetAccount}`);

    await driver.sleep(5000);

    // 600 saniye boyunca tweetleri çek
    await scrapeTweets(driver, 600000);
  } finally {
    // Tarayıcıyı kapat
    await driver.quit();
  }
}

async function scrollDown(driver, distance) {
  await driver.executeScript(`window.scrollBy(0, ${ distance });`);
}

async function scrapeTweets(driver, duration) {
  let tweets = [];
  const startTime = new Date().getTime();

  do {
    // Tweetleri bul
    const tweetElements = await driver.findElements(By.css('article[data-testid="tweet"]'));

    for (const tweetElement of tweetElements) {
      // Eğer retweet değilse tweet metnini al
      try {
        await tweetElement.findElement(By.css('span[data-testid="socialContext"]')); // retweet elementi
      } catch (error) {
        const tweetText = await tweetElement.findElement(By.css('article[data-testid="tweet"] div[data-testid="tweetText"] span')).getText();
        const tweetDate = await tweetElement.findElement(By.css('article[data-testid="tweet"] time')).getAttribute('datetime');
        
        const timestampDate = Date.parse(tweetDate);
        
        // Yeni tweeti kontrol et ve sadece yeni olanları ekle
        if (!tweets.some(tweet => tweet.tweetText === tweetText && tweet.timestampDate === timestampDate)) {
          tweets.push({ tweetText, timestampDate });
        }
      }
    }

    // Verileri CSV dosyasına ekleyin
    const fileName = `${config.scrape.targetAccount}_tweets.csv`;
    await appendToCsv(tweets, fileName);

    // 1 saniye bekle
    await driver.sleep(1000);

    // Scroll down işlemi
    await scrollDown(driver, 200);

    // Geçen süreyi kontrol et
  } while ((new Date().getTime()) - startTime < duration);

  return tweets;
}

async function appendToCsv(newTweets, fileName) {
  // Önce dosyadaki mevcut verileri alın
  let existingTweets = [];
  try {
    const fileContent = await readFile(fileName, 'utf8');
    existingTweets = fileContent.trim().split('\n').map(line => {
      const [tweetText, timestampDate] = line.split(',');
      return { tweetText, timestampDate: parseInt(timestampDate) };
    });
  } catch (error) {
    // Dosya bulunamazsa ya da okunamazsa, mevcut tweetler boş kalır
  }

  // Yeni tweetlerle eski tweetleri birleştirin
  const allTweets = [...existingTweets, ...newTweets];

  // Tekrar CSV dosyasına yaz
  const excelData = allTweets.map(tweet => `${tweet.tweetText}, ${tweet.timestampDate}`).join('\n');
  await writeFile(fileName, excelData, 'utf8');
  console.log(`Veriler başarıyla ${fileName} dosyasına eklendi.`);
}

// Fonksiyonu çalıştır
scrapeTwitterAccount(config);