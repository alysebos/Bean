# :) Hello!

## Links to app

**Note**: It totally works!

[Link to Bean Deployment](https://alysebos.github.io/bean-front-end/)

[Link to Bean Trello Board](https://trello.com/b/NxTEratC/bean)

## The Vision for Bean - Users should be able to do the following:

* Register and login to the service
* View a list of their pets on the dashboard
* View a prompt to add a pet on the dashboard if they do not have one already
* Add new pets from the dashboard
* Return to the dashboard from any screen
* Logout from any screen
* Click on a pet to navigate from the dashboard to that pet’s detail screen
* Preview all checkups on pet’s detail screen
* Add checkups from pet detail screen
* Edit the pet from the pet detail screen
* Delete the pet from the pet detail screen
* View a prompt to add a checkup if the pet does not have one yet
* Enter only pertinent data for the checkup
* Click on a checkup to navigate from the pet detail screen to the checkup detail screen
* View details recorded for that checkup
* Edit the checkup from the checkup detail screen
* Delete the checkup from the checkup detail screen
* Easily navigate and flow through screens

## Technologies Used
* Frontend: Angular
* Server: Node
* Authentication: Passport
* API: Express
* Database: MongoDB

## Tools Used
* Terminal
* Visual Studio
* Git/Github
* Heroku
* Postman
* Travis Continuous Integration
* Angular CLI
* Node Package Manager

## Issues Encountered
* User Authentication and JWT Storage
    * I ran into issues with authentication - My local storage was saving an undefined value instead of the JWT. I fixed this by following the trail back to my API to find that my backend was not responding with any data, regardless of not throwing an error.
* Handling dates in JavaScript - Always showing one day off
    * I found that if I would enter 10/5 for example, when the date was displayed it would read 10/4. After some research, I found out how to account for the time zone difference and display the correct date to the user.
* Attribute values submitting even if a user has unchecked the box
    * On the add and edit checkup forms, users have to click a checkbox for attributes to become editable. If they uncheck a box, the input field disappears, but any value they typed would be submitted when the form was submitted. I used logical statements to only submit the value for that field if the checkbox was still checked to fix this.
* Over complication of checkup schema
    * In development of my back end, I had massively over complicated the schema for storing checkups. I needed to simplify it because my code was getting unmanageable with trying to access data in many nested objects. I rewrote parts of my backend to fix this and it’s much cleaner and more manageable now.
* Form validation woes
    * In user testing, it was pointed out to me that many of my forms allowed invalid input, like negative weight for pets. Another bug found was on the login form. A validation error would show even if the user entered the correct credentials because it was still waiting for the server to respond. I managed to work out all the form validation problems which were brought to my attention.
* Components trying to access information before http request was made, i.e. the nav-bar showing, “Welcome back,” without the user’s name.
    * Some components were loading before information was available to them in the beginning of my development. I learned how to get those components to update once the information was available. I stored a value in a variable that would update once the Http request responded with the correct data. One instance of this was the nav-bar in app-component. It would display, “Welcome back,” without the user’s name, and this was happening because no request had been made to the /users endpoint yet, so the app didn’t know the user’s name yet.

## Future Features
* User management
    * Change email
    * Change password
    * Recover password
* Fix tests - Currently CI is bypassing them
* Error handling in Angular. Currently, the front end doesn’t reflect when the backend server doesn’t respond
* Loading animation when waiting for http responses
* Ability to record actions the vet took during their checkup
    * Vaccines, prescriptions, treatments
* Refactor the code, make it DRY, and create services for recycled functions
* Allow users to upload photos of their pets to display as avatars
