    
class _chatui {

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

        this.defaultGroupItemHandler = (group, item) => {
            def_log("Retrieving chat history for #" + group.name, false);
            groupExSelect(item, 'group-panel-item', 'group-panel-item-active');
            
            document.getElementById("chat_grp_title").innerHTML = group["name"];
            app.groups.active = group['id'];

            retrieve_chat_history(group['id'], (sdata) => {
                chatui.poplulateChat(JSON.parse(sdata)["gi_messages"]);
            }, def_log);
        }

        this.defaultGroupProfItemHandler = (group, item) => {
            def_log("Retrieving user data for #" + group.name, false);
            groupExSelect(item, 'gl-item', 'gl-item-active');

            this.groupProfListConfig.active = group['id'];
            this.refreshUserList();
        }
    }

    /* @async */
    addUserToGroup(username, success, error) {
        add_user(
            username, this.groupProfListConfig.active,
            (sdata) => {
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
                    () => { this.groupProfList.firstChild.click(); }, false
                );
                this.groupNavList.firstChild.click();
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

var appui = new _appui();
var chatui = new _chatui();

window.addEventListener('load', () => { appui.forceGlobalGroupRefresh(); }, false);
