// API endpoint declarations

// Global vars
var app, appui, chatui, wboard;

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
        
        // App subdomain for Hasura API endpoints
        this.config = { project: 'ditz97' }
        
        this.urls = {
            auth: "https://auth." + this.config.project + ".hasura-app.io/",
            data: "https://data." + this.config.project + ".hasura-app.io/"
        }

        this.groups = { data: [], dirty: true, active: -1 };
        this.channels = { root: "/", chat: "/chat" };
        this.sockets = {};
    }

    initiateSockets() {
        if (!app.user.token) return;

        Object.keys(this.channels).map((key) => {
            let channel = this.channels[key];
            if (!this.sockets[channel]) {
                this.sockets[channel] = io(channel);

                this.sockets[channel].on('feedback', (data) => {
                    def_log("(Server) " + data["message"], false);
                });
            }
        });

        // Initiate root socket
        this.sockets[this.channels.root].emit('init', this.user.id, this.user.username);
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
        this.groups.data = []; this.groups.dirty = true;
        this.saveUser();
    }
    
    clearSession() { this.clearUser(); }
};

app = new _app();

// Utility functions
var groupExSelect = (obj, groupSelector, activeKlass) => {
    let act = document.querySelectorAll('.' + groupSelector + '.' + activeKlass)[0];

    if (act && act.classList.contains(activeKlass))
        act.classList.toggle(activeKlass);
    obj.classList.toggle(activeKlass);
}

var toggleFeedbackTextClass = (obj, rKlass, aKlass, text) => {
    obj.blur();
    obj.classList.remove(rKlass); obj.classList.add(aKlass);

    if (text !== undefined && typeof text === "string")
        obj.value = text;
}

var resetFeedbackTextClass = (obj, filterKlasses) => {
    let shouldClear = false;
    filterKlasses.map((klass) => {
        if (!shouldClear && obj.classList.contains(klass))
            shouldClear = true;
        obj.classList.remove(klass);
    });

    if (shouldClear) obj.value = "";
}
