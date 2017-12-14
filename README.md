# PeopleNet
Backbone.js: Implementation of breadth-first search algorithm to find shortest path

## Clone the repository

Make sure you are checked out on the [peoplenet-app](https://github.com/karthi1987/peoplenet.git) branch before running the following!

> After you cloned the repo, you will see the following folder strucure, navigate to the peoplenet folder and look for index.html, Please open them in web browser and you can see the site is running.

## Folder Structure

    ├── index.html                     # Site index file
    ├── js                             # Site Script files
    │   ├── config.js                  # Maze configuration files
    │   ├── peoplenet.class.js         # Maze base class file
    │   ├── app.js                     # Site application js
    ├── css
        ├── app.css                    # Site style file
     
     
## Tech Stack
```
1. Html5
2. Css3,
3. Bootstrap
4. javaScript
5. Backbone.js
```

## Application
Site provides two menu options, `Predefiend Maze and Custom Maze`
    
## Predefined Maze 
> It has list of following exercises,

  1. maze1.txt
  2. maze3.txt

[![Maze 1]( https://github.com/karthi1987/peoplenet/blob/master/images/Maze1_View.png )]

## Custom Maze 
> Which gives an option for the user to change the maze settings

[![Custom Maze]( https://github.com/karthi1987/peoplenet/blob/master/images/Maze_Find_Shortest_Path.png )]

List of following buttons which controls the maze,
  1. **Edit Start Coordinates**: Click this button to select any square in grid inorder to change starting coordinates(X) When user wants to change their Starting Coordinates(X)
  3. **Edit End Coordinates**: Click this button to select any square in grid inorder to change ending coordinates(Y) When user wants to change.
  3. **Add Wall**: After user set their XY Coordinates, they can choose the wall/block between the XY Coordinates by selecting the Add Wall button at the top
  4. ** Find shortest path**: After user set XY Coordinates and wall, inorder to find the shortest path, click on this button to see the path in the grid.
  4. **Clear path**: User can clear their selected path.
  5. **Clear everything**: It clear everything on the maze, It has an exception of XY Coordinates.
