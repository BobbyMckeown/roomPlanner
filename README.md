# Room Planner

Room Planner is my Final Year Project. It is an interactive interior layout application that lets a user draw a room in 2D, place furniture inside that room, and then switch to a 3D view to visualise the layout using real GLTF models.

The main idea of the project is to combine simple 2D planning with a more realistic 3D representation so that a user can sketch a room quickly and then inspect how the layout looks in a spatial view.

## Current Project Status

The current version of the project includes:

- A 2D room drawing system using Konva.js
- A furniture sidebar with draggable items loaded from JSON data
- GLTF-based furniture previews in the 2D interface
- A 3D scene built with Three.js
- 3D room generation based on the walls drawn in 2D
- 3D furniture loading using GLTF models
- A login/register modal on the frontend UI

At the moment, the project is mainly focused on the frontend interaction and 3D visualisation workflow. The database-backed account system is planned as the next stage.

## Technologies Used So Far

### Frontend

- HTML5
- CSS3
- JavaScript
- Konva.js for the 2D planning canvas
- Three.js for the 3D scene, lighting, camera controls, and model rendering
- GLTF / GLB assets for 3D furniture models

### Data / Storage

- JSON for furniture definitions and metadata
- localStorage for temporarily preserving room layouts and furniture placements when moving between 2D and 3D views

### Planned Backend / Database

The next planned stage of the project is to add a backend built with:

- C#
- ASP.NET Core Web API
- SQLite

This backend will be used for:

- User account storage
- Login and registration
- Saving room layouts to a database
- Loading previously saved room designs from a user account

## Main Features

### 2D Room Planning

Users can draw a room by placing points on the canvas. Once the polygon is closed, the room is displayed as a filled floor shape.

### Furniture Placement

Furniture items are loaded from a JSON file and displayed in categories. Items can be dragged into the room layout and positioned on the 2D canvas.

### 3D Room Visualisation

The wall points created in the 2D planner are transferred into the 3D scene. These points are used to generate:

- A floor shape matching the drawn room
- Wall meshes around the perimeter

### 3D Furniture Rendering

Furniture placed in 2D is also transferred to the 3D scene and rendered using the corresponding GLTF models.



