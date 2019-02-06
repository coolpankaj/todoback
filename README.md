# TODO LIST - LIVE MANAGEMENT SYSTEM

Angular platform is used to build scalable application. It uses socket.io to make the web app realtime. Angular is highly robust, meanwhile allows to create app for multiple platform like mobile, desktop and web.

ToDo mean stack application is used to add your important task. You can create list and add items to it, items can also have subitems.

## Requirements
These following will allow you to use this project in proper way.
1. Install Node and npm as per official documentation.

    [Nodejs](https://nodejs.org/en/) -- install Nodejs
2. Install Git to clone the repo.

    [GIT](https://git-scm.com/downloads) -- install Github
3. Install angular-cli
   ```bash
   > npm install -g @angular/cli
   ```

## Installation

1. Create folder in your local drive.
2. Move to your local folder.
   ```bash
   cd your-folder-name
   ```
3. Now, git init
   ```bash
   git init
   ```
   ```bash
   git remote add origin https://github.com/pankajsaini123/todoback.git
   ```
   ```bash
   git pull origin master
   ```
   Install all dependencies that need to run project. 
   ```bash
   npm i
   ```
   Run the command to run project in default browser.
   ```bash
   ng serve --open
   ```

## More about the application
  **Project Description -**

This project is aimed to create a ready to deploy Live TODO List management system.

A Frontend developed and a REST API (with realtime functionalities) created using the technologies.

Frontend Technologies used - HTML5, CSS3, JS, Bootstrap and Angular

Backend Technologies used - NodeJS, ExpressJS and Socket.IO

Database used - MongoDB and Redis

**Features of the Application -**

**1) User management System -**

**a) Signup -**

User should be able to sign up on the platform providing all
details like FirstName, Last Name, Email and Mobile number. Country code for mobile number (like 91 for India) should also be stored. You may find the country code data on these links
(http://country.io/phone.json,http://country.io/names.json)

**b) Login -** 

User should be able to login using the credentials provided at
signup.

**c) Forgot password -** 

User should be able to recover password using a link or
code on email. You may use Nodemailer to send emails. (Please use a dummy gmail account, not your real account).

**2) To do list management (single user) -**


a) Once user logs into the system, he should see an option to create a ToDo List.

b) User should be able to create, a new empty list, by clicking on a create button

c) User should be able to add, delete and edit items to the list

d) User should also be able to add sub-todo-items, as child of any item node. Such that, complete list should take a tree shape, with items and their child items.

e) User should be able to mark an item as "done" or "open".

f) User should be able to see his old ToDo Lists, once logged in.

**3) Friend List -**

a) User should also be able to send friend requests, to the users on the system. Once requests are accepted, the friend should be added in user's friend list. Friends should be Notified, in real time using notifications.

**4) To do List management (multi-user) -**

a) Friends should be able to edit, delete, update the list of the user.

b) On every action, all friends should be notified, in real time, of what specific change is done by which friend. Also the list should be in sync with all friends, at any time, i.e. all actions should be reflected in real time.

c) Any friend should be able to undo, any number of actions, done in past. Each undo action, should remove the last change, done by any user. So, history of all actions should be persisted in database, so as, not to lose actions done in past.


**5) Error Views and messages -**

You have to handle each major error response (like 404 or 500) with a different page. Also, all kind of errors, exceptions and messages should be handled properly on frontend. The user should be aware all the time on frontend about what is happening in the system.

## Documentation

All required api documentation using apiDoc.

[Apidoc](https://pankajsaini123.github.io/todoback/) - Api Documentation for todo app backend

## Authors

- **Pankaj Singh** -- [Pankaj Singh](https://github.com/pankajsaini123)

## Acknowledgements

- I would like to thank my friends who supports me during the development of this app.
