
class _chatui {
    constructor() {
        this.chatMap = {}
        this.chatThread = document.getElementById("chats");

        this.charMap = { 60: "&lt", 62: "&gt", 38: "&amp", 34: "&quot", 39: "&#39" };
    }

    scrollChatToView() {
        $(this.chatThread).stop().animate({
            scrollTop: $(this.chatThread)[0].scrollHeight - $(this.chatThread).outerHeight()
        }, 500, "easeOutExpo");
    }

    initSocketHandlers() {
        // Handle socket relevant notifs
        app.sockets[app.channels.chat].on('new-message', (data) => {
            this.handleIncomingMessage(data["message"], false, data["username"]);
        });

        app.sockets[app.channels.chat].on('connect-notify', (data) => {
            this.appendInfoElement(data["username"] + " is now online");
        });

        app.sockets[app.channels.chat].on('disconnect-notify', (data) => {
            this.appendInfoElement(data["username"] + " went offline");
        });
    }

    handleIncomingMessage(message, isSource, author, autoScroll = true) {
        // Pass the incoming message through a custom text encoder that
        // converts all special HTML characters to their escaped versions
        let msg = this.encodeSpecialChars(message);

        // TODO
        // Placeholder for further processing here (bold, strikethrough, italics support)

        let msgItem = this.createMsgElement(msg, isSource, author);
        this.chatThread.appendChild(msgItem);
        if (autoScroll) this.scrollChatToView();
    }

    appendInfoElement(message) {
        let infoItem = document.createElement('div');
        infoItem.classList.add('info-msg');

        let infoText = document.createElement('span');
        infoText.classList.add('msg-text');
        infoText.innerHTML = message;
        infoItem.appendChild(infoText);

        this.chatThread.appendChild(infoItem);
        this.scrollChatToView();
    }

    createMsgElement(message, isSource, author = "") {
        let msgItem = document.createElement('div');
        msgItem.classList.add('msg');

        let msgText = document.createElement('span');
        msgText.classList.add('msg-text');
        msgText.innerHTML = message;

        let msgOwner = null;
        if (isSource) {
            // Current user is the message author
            msgItem.classList.add('internal-msg');
        } else {
            // External user
            msgItem.classList.add('external-msg');
            msgOwner = document.createElement('span');
            msgOwner.classList.add('msg-owner');
            msgOwner.innerHTML = author;
        }

        if (msgOwner !== null) msgItem.appendChild(msgOwner);
        msgItem.appendChild(msgText);
        return msgItem;
    }

    encodeSpecialChars(text) {
        return text.split('').reduce((acc, c) => {
            let ec = this.charMap[c.charCodeAt(0)];
            return acc + (ec ? ec : c);
        }, "");
    }

    pushMessage(message, author) {
        if (message !== typeof "string" && !message) return;

        message = message.trim();
        if (message.length === 0) return;

        let msgItem = this.createMsgElement(
            this.encodeSpecialChars(message), author.id === app.user.id, author.username);
        this.chatThread.appendChild(msgItem);
        this.scrollChatToView();

        dispatch_message(
            message, app.groups.active,
            (sdata) => {
                // Invalidate message buffer for current group,
                // so that it's updated on the next bulk retrieval
                this.chatMap[app.groups.active]["dirty"] = true;
                def_log("Message sent successfully", false);

                // Emit a message push event
                app.sockets[app.channels.chat].emit('push-msg', message);
            },
            (edata) => { def_log("Error sending message"); }
        );
    }

    poplulateChat(group_id, msgArray) {
        // Cache messages to prevent unnecessary API calls
        this.chatMap[group_id] = { "msgs": msgArray, "dirty": false };
    }

    renderChatHistory(group_id) {
        if (!this.chatMap[group_id]) return;

        // Clear chat window
        this.chatThread.innerHTML = "";
        this.chatMap[group_id]["msgs"].map((msg) => {
            this.handleIncomingMessage(
                msg["body"],
                msg["msg_author"]["id"] === app.user.id,
                msg["msg_author"]["username"], false
            );
        });

        this.scrollChatToView();
    }

    needsUpdate(group_id) {
        return (!this.chatMap[group_id] ||
                this.chatMap[group_id]["dirty"] === undefined ||
                this.chatMap[group_id]["dirty"] === true);
    }
}

class _appui {
    constructor() {
        this.groupNavList = document.getElementById('group_nav_list');
        this.groupProfList = document.getElementById('group_prof_list');
        this.groupUserList = document.getElementById('gi_user_list');
        this.groupProfListConfig = { active: 0 }

        this.userAddText = document.getElementsByName('new-usr')[0];
        this.userAddBtn = document.getElementById('add_usr_btn');
        this.userAddBtn.addEventListener('click', () => {
            this.addUserToGroup(this.userAddText.value,
                (sdata) => {
                    toggleFeedbackTextClass(
                        this.userAddText, "error-text", "success-text", "User added successfully"
                    );
                },
                (edata) => {
                    toggleFeedbackTextClass(
                        this.userAddText, "success-text", "error-text", JSON.parse(edata)["message"]
                    );
                }
            );
        });
        this.userAddText.addEventListener('focus', () => {
            resetFeedbackTextClass(this.userAddText, [ "success-text", "error-text" ]);
        });

        this.grpAddText = document.getElementsByName('new-grp')[0];
        this.grpAddBtn = document.getElementById('add_grp_btn');
        this.grpAddBtn.addEventListener('click', () => {
            this.addGroup(this.grpAddText.value,
                (sdata) => {
                    toggleFeedbackTextClass(
                        this.grpAddText, "error-text", "success-text", "Group added successfully"
                    );
                },
                (edata) => {
                    toggleFeedbackTextClass(
                        this.grpAddText, "success-text", "error-text", JSON.parse(edata)["message"]
                    );
                }
            );
        });
        this.grpAddText.addEventListener('focus', () => {
            resetFeedbackTextClass(this.grpAddText, [ "success-text", "error-text" ]);
        });

        this.sockInitiated = false;
        this.defaultGroupItemHandler = (group, item) => {
            def_log("Retrieving chat history for #" + group.name, false);
            groupExSelect(item, 'group-panel-item', 'group-panel-item-active');
            
            document.getElementById("chat_grp_title").innerHTML = group["name"];
            app.groups.active = group['id'];

            if (chatui.needsUpdate(group['id'])) {
                retrieve_chat_history(group['id'], (sdata) => {
                    // Poplulate and render messages
                    chatui.poplulateChat(group['id'], JSON.parse(sdata)["gi_messages"]);
                    chatui.renderChatHistory(group['id']);
                }, def_log);
            } else {
                // Only render the messages
                chatui.renderChatHistory(group['id']);
            }

            if (this.sockInitiated === true) {
                // Emit a group switch event
                app.sockets[app.channels.chat].emit('group-switch', app.groups.active);
            } else {
                // Init current chat socket
                app.sockets[app.channels.chat].emit('init', app.user.username, app.groups.active);
                this.sockInitiated = true;
            }
        }

        this.defaultGroupProfItemHandler = (group, item) => {
            def_log("Retrieving user data for #" + group.name, false);
            groupExSelect(item, 'gl-item', 'gl-item-active');

            this.groupProfListConfig.active = group['id'];
            this.refreshUserList();
        }
    }

    initSocketHandlers() {
        app.sockets[app.channels.root].on('new-group', (data) => {
            // Ignore group data for now
            this.forceGlobalGroupRefresh();
        });
    }

    selectGroupItemById(list, id) {
        if (list.children.length === 0) return;

        let gitems = list.children;
        for (var i = 0; i < gitems.length; i++) {
            if (gitems[i].getAttribute("data-gid") == id) {
                gitems[i].click(); break;
            }
        }
    }

    selectActiveGroupItem(list) {
        if (list.children.length === 0) return;

        if (app.groups.active === -1) list.firstChild.click();
        else this.selectGroupItemById(list, app.groups.active);
    }

    /* @async */
    addUserToGroup(username, success, error) {
        add_user(
            username, this.groupProfListConfig.active,
            (sdata) => {
                let obj = JSON.parse(sdata);
                let id = obj["id"];
                let gid = obj["group_id"] || this.groupProfListConfig.active;
                
                // Emit group add info to user
                app.sockets[app.channels.root].emit('add-user-to-group', id, gid);

                this.refreshUserList();
                if (success && typeof success === 'function') success(sdata);
            },
            (edata) => {
                if (error && typeof error === 'function') error(edata);
            }
        );
    }

    /* @async */
    addGroup(group_name, success, error) {
        add_group(
            group_name,
            (sdata) => { this.forceGlobalGroupRefresh(); success(sdata); },
            (edata) => { error(edata); }
        );
    }

    forceGlobalGroupRefresh() {
        app.groups.dirty = true;
        this.refreshGroupList(
            this.groupNavList, 'group-panel-item', this.defaultGroupItemHandler,
            () => {
                this.refreshGroupList(
                    this.groupProfList, 'gl-item', this.defaultGroupProfItemHandler,
                    () => { this.selectActiveGroupItem(this.groupProfList); }, false
                );
                this.selectActiveGroupItem(this.groupNavList);
            }
        );
    }

    /* @asycn */
    refreshUserList() {
        get_users(this.groupProfListConfig.active, (data) => {
            let ulist = JSON.parse(data);
            let fMap = {
                0: (user) => user['username'],
                1: (user) => user['name'],
                2: (user) => user['admin'] ? 'Leader' : 'Member'
            }

            // Clear current list
            this.groupUserList.innerHTML = '';
            for (var i = 0; i < ulist.length; i++) {
                // Construct user items
                let uitem = document.createElement('div');
                uitem.classList.add('gi-user');

                // Create user data columns
                Object.keys(fMap).map((key) => {
                    let col = document.createElement('span');
                    col.innerHTML = fMap[key](ulist[i]);
                    uitem.appendChild(col);
                });

                // Append user item to main list
                this.groupUserList.appendChild(uitem);
            }
        });
    }

    /* @async */
    refreshGroupList(list, itemKlass, callback, postRefresh, needUpdate = true) {
        let postUpdate = () => {
            // Clear all contents
            list.innerHTML = '';
            app.groups.data.map((group) => {
                // Construct an item element
                let gitem = document.createElement('div');
                let gitem_span = document.createElement('span');

                gitem.classList.add(itemKlass);
                gitem_span.innerHTML = group['name'];
                gitem.appendChild(gitem_span);

                // Set up custom attributes for mapping to group objects
                gitem.setAttribute('data-gid', group['id']);
                gitem.addEventListener('click', callback.bind(this, group, gitem), false);

                // Append child to list
                list.appendChild(gitem);
            });

            if (postRefresh && typeof postRefresh === 'function') postRefresh();
        }

        if (needUpdate) app.updateGroupData(postUpdate);
        else postUpdate();
    }
}

appui = new _appui();
chatui = new _chatui();
