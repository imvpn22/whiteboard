// API endpoint declarations

var def_log = (e, err = true) => {
    var dt = (new Date()).toLocaleString();
    console.log("[" + (err ? "ERROR" : "INFO ") + " | " + dt + "]: " + e);
}

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

        this.groups = { data: [], dirty: true };
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

    updateGroupData(postFn) {
        if (this.groups.data.length === 0 || this.groups.dirty) {
            this.groups.data = [];
            get_groups((data) => {
                let obj = JSON.parse(data);
                // Excpecting obj to be an array
                obj.map((group) => { this.groups.data.push(group); });
                this.groups.dirty = false;

                if (postFn !== undefined) postFn();
            });
        }
    }
    
    clearUser() {
        this.user = anonUser;
        this.saveUser();
    }
    
    clearSession() { this.clearUser(); }
};

var app = new _app();

// export default (new app());
