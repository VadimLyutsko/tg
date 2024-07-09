const TelegramBot = require('node-telegram-bot-api');
// подключаем (инициализируем) библиотеку, которую установили ранее  
// const token = 'Указываем в кавычках токен, который выдал Телеграм'
const token = '7017937555:AAEdSPJ2-fcLhifsTytw6n75Xe33FMeL-sc'

// задаем токен, сам API-ключ храним в отдельном файле //
const bot = new TelegramBot(token, {polling: true});
// создаем bot, polling в значении true необходим для получения обновлений с серверов ТГ, чтобы бот работал корректно//
function formatProductCaption(product) {
    return `*${product.name}*\nPrice: ${product.price}\nDescription: ${product.description}`;
}
// функция formatProductCaption принимает переменную product и возвращает название, цену, описание, но вы можете добавлять другие необходимые поля//
const products = [
    {
        id: 1,
        name: 'Product 1',
        price: '$10',
        description: 'Description of Product 1',
        imageUrl: 'https://plus.unsplash.com/premium_photo-1684534125661-614f59f16f2e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    },
    {
        id: 2,
        name: 'Product 2',
        price: '$20',
        description: 'Description of Product 2',
        imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80'
    },
];
// создаем массив products, в котором лежат товары с нужными нам переменными: id, name, price, description, imageUrl //
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const response = 'Привет! Добро пожаловать в Telegram Bot web app!\n\nЗдесь есть вот такие товары:';
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
                inline_keyboard: [[{text: 'Показать подробнее', callback_data: `product_${index}`}]]
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
        return sendProductList(chatId, 'Посмотрите, вот здесь есть продукты:');
    }

    const productId = data.split('_')[1];
    const selectedProduct = products[productId];

    if (selectedProduct) {
        await bot.sendPhoto(chatId, selectedProduct.imageUrl, {
            caption: formatProductCaption(selectedProduct),
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[{text: 'Назад к товарам', callback_data: 'back'}]]
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