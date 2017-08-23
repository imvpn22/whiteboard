
class _chatui {

}

class _appui {
    constructor() {
        this.groupNavList = document.getElementById('group_nav_list');
        this.groupProfList = document.getElementById('group_prof_list');
        this.groupUserList = document.getElementById('gi_user_list');
        this.groupProfListConfig = { active: 0 }

        this.defaultGroupItemHandler = (group) => {
            console.log("Retrieving chat history for #" + group.name);
            // chatui.setChatHistory(app.retrieveChatHistory(group));
        }

        this.defaultGroupProfItemHandler = (group) => {
            console.log("Retrieving user data for #" + group.name);

            this.groupProfListConfig.active = group['id'];
            this.refreshUserList();
        }
    }

    /* @asycn */
    refreshUserList() {
        get_users(this.groupProfListConfig.active, (data) => {
            let ulist = JSON.parse(data);
            let fMap = {
                0: (user) => user['username'],
                1: (user) => user['name'],
                2: (user) => user['admin'] ? 'Admin' : 'Member'
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
                gitem.addEventListener('click', callback.bind(this, group), false);

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

window.addEventListener('load', () => {
    appui.refreshGroupList(
        appui.groupNavList, 'group-panel-item', appui.defaultGroupItemHandler,
        () => {
            appui.refreshGroupList(appui.groupProfList, 'gl-item', appui.defaultGroupProfItemHandler, null, false);
        }
    );
}, false);
