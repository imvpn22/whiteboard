// API endpoint declarations

const localStorage = window.localStorage;

const anonUser = {
    id: 0,
    username: 'anonymous',
    roles: ['anonymous'],
    token: null
};

class _app {
    constructor() {
        const u = localStorage.getItem('whiteboard.user');
        if (u) {
            this.user = JSON.parse(u);
        } else {
            this.user = anonUser;
        }
        
        this.config = {
            project: 'aspartame64',
        }
        
        this.urls = {
            auth: "https://auth." + this.config.project + ".hasura-app.io/",
            data: "https://data." + this.config.project + ".hasura-app.io/"
        }
    }

    setUserName(username) {
        this.user.username = username;
        this.saveUser();
    }
    
    setUserInfo(userInfo) {
        this.user.id = userInfo.hasura_id;
        this.user.roles = userInfo.hasura_roles;
        this.user.token = userInfo.auth_token;
        
        ['name', 'username', 'email', 'mobile'].map(x => {
            this.user[x] = userInfo[x] ? userInfo[x] : this.user[x];
        });
        
        this.saveUser();
    }
    
    saveUser() {
        localStorage.setItem('whiteboard.user', JSON.stringify(this.user));
    }
    
    clearUser() {
        this.user = anonUser;
        this.saveUser();
    }
    
    clearSession() { this.clearUser(); }
};

var app = new _app();

// export default (new app());
