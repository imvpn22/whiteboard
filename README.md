

# White Board
## About
This is a webapp I developed during my internship at [Hasura](https://hasura.io) in May - Aug 2017. This project is hosted on hasura platform and uses Hasura APIs.  
App is live [here](https://whiteboard.ditz97.hasura-app.io/).

### App idea
> The idea of the app is pretty simple, to create an online platform for collaborative brainstorming by a group/team of people from  across the globe. This sort of brainstorming is usually required for startup ideas, projects or the onset of any form of development in a group...[read more](https://medium.com/@imvpn22/idea-for-an-app-first-step-to-internship-85f115d457ba)


## Features
This webapp provides basically three features -  

* __White Board:__ Drawing/Sketching on interactive canvas using various tools and colors.  
![Screen 1: Whiteboard](https://github.com/imvpn22/whiteboard/blob/master/app/src/screenshot/f1.png)  


* __Group Chat:__ Group chatting with the members of team, share file/image/video/link.  
![Screen 2: Group Chat](https://github.com/imvpn22/whiteboard/blob/master/app/src/screenshot/f2.png)  
  
  
* __Manage Group:__ Create group/team, add/remove members, promote a member to leader.  
![Screen 3: Manage Group](https://github.com/imvpn22/whiteboard/blob/master/app/src/screenshot/f3.png)  
  
  
### Video Overview  
Click to play
[![Alt text](https://i.ytimg.com/vi/jL5iklJD5Ss/maxresdefault.jpg)](https://www.youtube.com/watch?v=jL5iklJD5Ss&t)   
  
           
            
  
## Build
This project is based on Node.JS and uses NPM.  
Project build description is in app/src/README.md  
  
    
## Testing

### Quickstart - Build your own Docker image

Build the Docker image using the following command

```bash
$ docker build -t nodejs-express:<tag> .
```

Run the Docker container using the command below.

```bash
$ docker run -d -p 8080:8080 nodejs-express:<tag>
```

### Quickstart - git based pipeline

Follow the steps mentioned below for git based pipeline

1. Ensure that you have a git project
2. Edit `app/src/server.js`
3. Commit your changes

    ```bash
    $ git add .
    $ git commit -m "message"
    ```

4. Push the changes to git

    ```bash
    $ git push <remote> master
    ```

### Advanced usage

#### Port

Default Port for application is `8080` .
