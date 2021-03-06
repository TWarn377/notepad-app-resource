'use-strict';

const knexConfig = {
    development: {
        client: 'mysql',
        connection: {
          host: '127.0.0.1',
          user: 'notepad-resource',
          password: 'n0teP@d',
          database: 'notepad-dev'
        },
      },
    
      staging: {
        client: 'postgresql',
        connection: {
          database: 'my_db',
          user:     'username',
          password: 'password'
        },
        pool: {
          min: 2,
          max: 10
        },
        migrations: {
          tableName: 'knex_migrations'
        }
      },
    
      production: {
        client: 'postgresql',
        connection: {
          database: 'my_db',
          user:     'username',
          password: 'password'
        },
        pool: {
          min: 2,
          max: 10
        },
        migrations: {
          tableName: 'knex_migrations'
        }
      }
} 

const knex = require('knex')(knexConfig.development);

module.exports = knex;