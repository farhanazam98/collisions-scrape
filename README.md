# NYC Collision Map

## Overview

A tool to track and visualize motor vehicle collision hotspots across New York City by City Council district. 

**[Demo](https://farhanazam98.github.io/nyc-collision-map/)**

![Screenshot](assets/screenshot.png)

## Features

- **Daily Data Updates**: Automatically scrapes the latest NYC crash data via GitHub Actions
- **Interactive Map View**: Visualizes collision data using Leaflet.js, organized by City Council district
- **Automated Outreach**: Support for emailing each district's representative a summary of recent collisions, including a direct link to the relevant map view

## Tech Stack & Implementation

- **Data Scraping**: Python + GitHub Actions
- **Map Visualization**: [Leaflet.js](https://leafletjs.com/)
- **Automated Emails**: Python `smtplib`
- **Deployment**: GitHub Pages

## License

This project is open-source under the [MIT License](LICENSE).

