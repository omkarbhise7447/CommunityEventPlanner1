Event Management Application

This project is an event management application with a frontend built using Angular and a backend built using .NET. The application allows users to browse events, RSVP to them, cancel RSVP, create-update-delete your own event,
add the location of event on the map, user can see the event details, attendee list and location on map.

The project is divided into two main parts:
Frontend: An Angular application for the user interface.
Backend: A .NET API for managing events, RSVPs, and user data.

Setup and Run Instructions
Configure the Database
1.Update the connection string in EventPlannerApi/appsettings.json to point to your database:
{
  "ConnectionStrings": {
    "DatabaseConnection": "Data Source=<server-name>; Initial Catalog=<database-name>; User ID=<username>; Password=<password>; TrustServerCertificate=True;"
  }
}

2.Apply migrations to set up the database:
update-database

Frontend Setup and Run Instructions

1. Navigate to the Directory

cd /EventPlannerApi/ClientApp

2. Install Dependencies

npm install

3. Run the Frontend

ng serve

Backend Run Instructions

click on CommunityEventPlanner.sln

