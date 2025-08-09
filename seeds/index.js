const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    // useNewUrlParser: true, // this is depricated
    // useCreateIndex: true, // not supported
    // useUnifiedTopology: true // this is depricated
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '68871b5cfcd3ec5adc3f3d84',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Amet a quisquam voluptatibus ullam rerum deleniti assumenda alias sit doloremque dolorem aut, praesentium quasi impedit provident sed consequatur ipsum? Commodi, veritatis?',
            price, // (price: price)
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dscymmlov/image/upload/v1754205037/YelpCamp/n1yojdsxiq3qrv32cfjq.jpg',
                    filename: 'YelpCamp/n1yojdsxiq3qrv32cfjq',
                },
                {
                    url: 'https://res.cloudinary.com/dscymmlov/image/upload/v1754201689/YelpCamp/w6opqzcisnhcefsjumqf.jpg',
                    filename: 'YelpCamp/w6opqzcisnhcefsjumqf',
                },
                {
                    url: 'https://res.cloudinary.com/dscymmlov/image/upload/v1754201689/YelpCamp/zcseaofiorthgdsqgnhn.jpg',
                    filename: 'YelpCamp/zcseaofiorthgdsqgnhn',
                }
            ],
        })
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close();
})

// const mongoose = require('mongoose');
// const cities = require('./cities');
// const { places, descriptors } = require('./seedHelpers');
// const Campground = require('../models/campground');

// mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
//     // useNewUrlParser: true,
//     // useCreateIndex: true,
//     // useUnifiedTopology: true
// });

// const db = mongoose.connection;

// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", () => {
//     console.log("Database connected");
// });

// const sample = array => array[Math.floor(Math.random() * array.length)];


// const seedDB = async () => {
//     await Campground.deleteMany({});
//     for (let i = 0; i < 50; i++) {
//         const random1000 = Math.floor(Math.random() * 1000);
//         const camp = new Campground({
//             location: `${cities[random1000].city}, ${cities[random1000].state}`,
//             title: `${sample(descriptors)} ${sample(places)}`
//         })
//         await camp.save();
//     }
// }

// seedDB()