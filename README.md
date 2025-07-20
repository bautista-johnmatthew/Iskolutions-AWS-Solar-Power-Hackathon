# Iskolutions-AWS-Solar-Hackathon
Project repository of Team Iskolutions for the AWS Solar Hackathon 2025 

## Project Structure
- api - API side of the application
    - models
    - schemas
    - routes
        - handlers - Contain the actual functions based on action
        - routers - Attach each function to the route and http method
        - router.py - Initialise the routes to main application
        - routes.py - Describes the allowed routes 
    - services
- web - Website side of the application
    - src
        - icons - Logos and icons in png format
        - static 
            - css
            - js
        - templates - HTML files 
