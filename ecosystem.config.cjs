module.exports = {
    apps: [{
        name: "business-farmacie-backend",
        script: './src/app.js',
        instance: 1,
        exec_mode: "cluster",


        env: {
            NODE_ENV: "production",

            PORT: 7004,
            DATABASE_URL: 'postgresql://postgres:greenage@192.168.100.17:5432/',
            DATABASE_NAME: 'test-farmacie',
            DATABASE_NAME_MW: 'moin_weather',


            DOMAIN: 'https://admin.agronomics.pk',
            JWT_SECRET_KEY: 'your_jwt_secrect_key_if_uisng_jwt_token_authenticatiosdfasdfn',


            EMAIL: 'moindjango@gmail.com',
            EMAIL_PASS: 'rzxz ohbg xxfv wlzc',


            JAZZCASH_MERCHANT_ID: '89798745',
            JAZZCASH_PASSWORD: '620sss8h2u',
            JAZZCASH_HASH_SALT: '3y5s486t2w'
        }
    }
    ]
};