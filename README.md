# Interstellar Trade Route Simulator

A comprehensive web application for simulating and optimizing trade routes between fictional star systems. Built with modern web technologies and featuring both 2D and 3D visualizations.

## Features

### Landing Page
- **Beautiful Landing Page**: Modern, responsive design with hero section, features showcase, and testimonials
- **Smooth Animations**: Subtle animations without distracting floating effects
- **Call-to-Action**: Clear navigation to the main application

### Core Functionality
- **Star System Management**: Add, edit, and manage star systems with coordinates, population, resources, and economic data
- **Route Optimization**: Advanced algorithm to find optimal trade routes considering distance, fuel costs, and resource availability
- **Multiple Route Types**: Direct routes, hub-based routes, and multi-hop routes
- **Economic Analysis**: Track trade values, fuel costs, profits, and economic growth over time

### Visualizations
- **2D Galaxy Map**: Interactive D3.js-based galaxy map with zoom, pan, and route visualization
- **3D Space View**: Immersive Three.js 3D visualization of star systems and trade routes
- **Dashboard**: Comprehensive analytics with charts and statistics

### Data Management
- **CSV Import/Export**: Bulk import and export of star system data
- **Real-time Updates**: Live updates across all components
- **Persistent Storage**: MongoDB database for data persistence

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TailwindCSS** - Utility-first CSS framework for styling
- **D3.js** - Data visualization for 2D galaxy map
- **Three.js** - 3D graphics for space visualization
- **React Three Fiber** - React renderer for Three.js
- **Recharts** - Chart library for dashboard analytics
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Multer** - File upload handling
- **Express Validator** - Input validation

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd interstellar-trade-route-simulator
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   Create a `.env` file in the `server` directory:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/interstellar_trade
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

## Usage

### Getting Started

1. **Add Star Systems**: Navigate to the "Star Systems" page to add your first star systems
2. **Configure Resources**: Set up resources, consumption needs, and economic data for each system
3. **Optimize Routes**: Use the "Trade Routes" page to find optimal routes between systems
4. **Visualize**: Explore your galaxy using the 2D and 3D visualization modes
5. **Monitor**: Check the dashboard for economic growth and trade statistics

### Star System Data

Each star system includes:
- **Basic Info**: Name, coordinates (x, y, z), population
- **Resources**: Available resources with availability percentages and prices
- **Consumption**: Resource consumption needs
- **Economic Data**: Growth rate, trade hub status
- **Fuel Station**: Availability and pricing

### Route Optimization

The system considers:
- **Distance**: Direct distance between systems
- **Fuel Costs**: Based on distance and fuel station availability
- **Resource Availability**: Matching supply and demand
- **Economic Factors**: Population and growth rates
- **Waypoints**: Optional intermediate stops for complex routes

## API Endpoints

### Star Systems
- `GET /api/starsystems` - Get all star systems
- `POST /api/starsystems` - Create new star system
- `PUT /api/starsystems/:id` - Update star system
- `DELETE /api/starsystems/:id` - Delete star system
- `POST /api/starsystems/bulk` - Bulk import star systems

### Trade Routes
- `GET /api/traderoutes` - Get all trade routes
- `POST /api/traderoutes/optimize` - Optimize routes between systems
- `DELETE /api/traderoutes/:id` - Delete trade route

## Project Structure

```
interstellar-trade-route-simulator/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── ...
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Database configuration
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   └── index.js
└── package.json           # Root package.json
```

## Development

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend development server
- `npm run build` - Build the frontend for production

### Code Organization

- **Modular Design**: Components are organized by functionality
- **Reusable Services**: API calls are centralized in service files
- **Type Safety**: PropTypes and validation for better error handling
- **Responsive Design**: Mobile-first approach with TailwindCSS

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Future Enhancements

- [ ] Real-time multiplayer support
- [ ] Advanced economic simulation
- [ ] AI-powered route suggestions
- [ ] Mobile app version
- [ ] More visualization options
- [ ] Historical data analysis
- [ ] Trade route automation
- [ ] Resource market simulation

## Support

For issues and questions, please create an issue in the repository or contact the development team.
