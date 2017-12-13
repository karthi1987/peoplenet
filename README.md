# PeopleNet
Backbone.js: Implementation of breadth-first search algorithm to find shortest path

### Clone the repository

Make sure you are checked out on the [peoplenet-app](https://github.com/karthi1987/peoplenet.git) branch before running the following!

> After you cloned the repo, you will see the following folder strucure, navigate to the peoplenet folder and look for index.html, Please open them in web browser and you can see the site is running.

### Folder Structure

    ├── index.html                     # Site index file
    ├── js                             # Site Script files
    │   ├── config.js                  # Maze configuration files
    │   ├── peoplenet.class.js         # Maze base class file
    │   ├── app.js                     # Site application js
    ├── css
        ├── app.css                    # Site style file
     

### Application

Site provides two menu options, Predefiend Maze and Custom Maze

> Predefiend Maze

It has list of following exercises,
  1. maze1.txt
  2. maze3.txt

> Custom Maze

Which gives an option for the user to change the maze settings

List of following buttons which controls the maze,
  1. **Add Wall**: After user set their XY Coordinates, they can choose the wall/block between the XY Coordinates by selecting the ADD Wall button at the top
  2. **Edit Start Coordinates**: When user wants to change their Starting Coordinates(X)
  3. **Edit End Coordinates**: When user wants to change their Ending Coordinates(Y)
  4. **Clear path**: User can clear their selected walls
  5. **Clear everything**: It clear everything on the maze, It has an exception of XY Coordinates.
