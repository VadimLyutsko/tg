// 👇
const TelegramBot = require('node-telegram-bot-api');
// подключаем (инициализируем) библиотеку, которую установили ранее  
// const token = 'Указываем в кавычках токен, который выдал Телеграм'
const token = '7429393887:AAH721lZwiUE2PfRPj9gBpgqnlfa2Vu9yX4'

// задаем токен, сам API-ключ храним в отдельном файле //
const bot = new TelegramBot(token, {polling: true});
// создаем bot, polling в значении true необходим для получения обновлений с серверов ТГ, чтобы бот работал корректно//
function formatProductCaption(product) {
    return `*${product.name}*\nПодробнее: ${product.description}`;
}
// функция formatProductCaption принимает переменную product и возвращает название, цену, описание, но вы можете добавлять другие необходимые поля//
const products = [
  {
      id: 1,
      name: 'Добавить часы',
      description: 'Добавить отработанные часы за выбранный месяц',
      imageUrl: 'https://thumbs.dreamstime.com/b/%D0%B1%D0%B8%D0%B7%D0%BD%D0%B5%D1%81%D0%BC%D0%B5%D0%BD-%D0%B2-%D0%BA%D0%BE%D0%BD%D1%86%D0%B5%D0%BF%D1%86%D0%B8%D0%B8-%D0%BA%D0%BE%D0%BD%D1%82%D1%80%D0%BE%D0%BB%D1%8F-%D0%B2%D1%80%D0%B5%D0%BC%D0%B5%D0%BD%D0%B8-210055625.jpg'
  },
  {
      id: 2,
      name: 'Посмотреть ранее введенные часы',
      description: 'Посмотреть отработанные часы за выбранный месяц',
      imageUrl: 'https://wallpapersgood.ru/wallpapers/main2/201727/1499165645595b73cd2742b5.88006733.jpg'
  },
];
// создаем массив products, в котором лежат товары с нужными нам переменными: id, name, price, description, imageUrl //
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const response = 'Привет! Добро пожаловать в Telegram Bot web app!\n\nЗдесь есть вот такие возможности:';
    // Проходимся по массиву products методом map и создаем сами карточки //
    const messageOptions = products.map((product) => {
        return {
            chat_id: chatId,
            photo: product.imageUrl,
            caption: formatProductCaption(product),
            parse_mode: 'Markdown'
        };
    });

    await bot.sendMessage(chatId, response);

    // Отправляем сообщение с карточками продуктов
    await Promise.all(messageOptions.map((options, index) => {
        return bot.sendMessage(options.chat_id, options.caption, {
            parse_mode: options.parse_mode,
            reply_markup: {
                inline_keyboard: [[{text: 'Взаимодействовать', callback_data: `product_${index}`}]]
            }
        });
    }));
});

bot.on('callback_query', async (query) => {
    console.log('Здесь сообщение');

    const chatId = query.message.chat.id;
    const data = query.data;

    if (data === 'back') {
        // Отправляем карточки продуктов при запросе через inline keyboard
        return sendProductList(chatId, 'Вы вернулись в меню,\nздесь есть вот такие возможности:');
    }

    const productId = data.split('_')[1];
    const selectedProduct = products[productId];

    if (selectedProduct) {
        await bot.sendPhoto(chatId, selectedProduct.imageUrl, {
            caption: formatProductCaption(selectedProduct),
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[{text: 'Назад в меню', callback_data: 'back'}]]
            }
        });
    }
});

async function sendProductList(chatId, response) {
    await bot.sendMessage(chatId, response);

    const messageOptions = products.map((product, index) => {
        return {
            chat_id: chatId,
            photo: product.imageUrl,
            caption: formatProductCaption(product),
            parse_mode: 'Markdown',
            callback_data: `product_${index}` // Изменяем значение callback_data value
        };
    });

    await Promise.all(messageOptions.map((options, index) => {
        return bot.sendMessage(options.chat_id, options.caption, {
            parse_mode: options.parse_mode,
            reply_markup: {
                inline_keyboard: [[{text: 'Показатель детали', callback_data: options.callback_data}]]
            }
        });
    }));
}
console.log('Бот запускается...');