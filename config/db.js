 /**
  * IMPORTANT NOTES!!!
  *
  * REDIS DB MAP : DB 1 is used for jobs
  * DB 4 is used for cache
  * DB 2 is used for socket tokens
  * DB 3 is used for email tokens
  */

module.exports = {

  redis : {

    tokens : {
      email : {
        host: '127.0.0.1', 
        port: 6379, 
        auth_pass: '',
        ttl : 1000 * 60 * 60 * 24 * 7,
        db: 3
      },

      socket : {
        host: '127.0.0.1', 
        port: 6379, 
        ttl : 1000 * 60 * 60 * 48,
        auth_pass: '',
        db: 2
      }
    },

    app : {
      host: '127.0.0.1', 
      port: 6379, 
      auth_pass: '',
      db: 4
    }
  },

  mongo : {
    app : {
      host: 'localhost',
      user: '',
      password: '',
      port:27017,
      database: 'disambiguation',

      toString : function(){
          var url = 'mongodb://'
          if(this.user && this.password) url += this.user + ':' + this.password + '@'
          url += this.host + ':' + this.port + '/' + this.database

          return url
      }
    },

    sessions : {

      '*' : {
        db:'sessions-db', 
        password : '', 
        username : '' 
      },

      
    }

    
  }


}