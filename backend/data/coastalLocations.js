/**
 * List of coastal locations for the Coastle Alert system
 * These locations are used to restrict the map selection to coastal areas only
 * Expanded to include worldwide coastal locations with typical wind patterns
 */

export const coastalLocations = [
  // Famous Beach Locations
  { name: 'Bondi Beach', country: 'Australia', lat: -33.8915, lng: 151.2767, avgWindSpeed: 12 },
  { name: 'Copacabana Beach', country: 'Brazil', lat: -22.9698, lng: -43.1866, avgWindSpeed: 9 },
  { name: 'Waikiki Beach', country: 'United States', lat: 21.2793, lng: -157.8292, avgWindSpeed: 10 },
  { name: 'Malibu Beach', country: 'United States', lat: 34.0259, lng: -118.7798, avgWindSpeed: 8 },
  { name: 'South Beach', country: 'United States', lat: 25.7825, lng: -80.1340, avgWindSpeed: 11 },
  { name: 'Ipanema Beach', country: 'Brazil', lat: -22.9868, lng: -43.2028, avgWindSpeed: 10 },
  { name: 'Bora Bora Beach', country: 'French Polynesia', lat: -16.5004, lng: -151.7415, avgWindSpeed: 14 },
  { name: 'Phuket Beach', country: 'Thailand', lat: 7.9519, lng: 98.3381, avgWindSpeed: 7 },
  { name: 'Boracay Beach', country: 'Philippines', lat: 11.9674, lng: 121.9248, avgWindSpeed: 9 },
  { name: 'Patong Beach', country: 'Thailand', lat: 7.9037, lng: 98.2967, avgWindSpeed: 8 },
  // United Kingdom
  { name: 'Brighton Beach', country: 'United Kingdom', lat: 50.8225, lng: -0.1372, avgWindSpeed: 12 },
  { name: 'Fistral Beach', country: 'United Kingdom', lat: 50.4170, lng: -5.1005, avgWindSpeed: 16 },
  { name: 'Camber Sands Beach', country: 'United Kingdom', lat: 50.9331, lng: 0.7948, avgWindSpeed: 14 },
  { name: 'Dover', country: 'United Kingdom', lat: 51.1295, lng: 1.3089, avgWindSpeed: 14 },
  { name: 'Liverpool', country: 'United Kingdom', lat: 53.4084, lng: -2.9916, avgWindSpeed: 13 },
  { name: 'Plymouth', country: 'United Kingdom', lat: 50.3755, lng: -4.1427, avgWindSpeed: 15 },
  { name: 'Portsmouth', country: 'United Kingdom', lat: 50.8198, lng: -1.0880, avgWindSpeed: 11 },
  { name: 'Blackpool', country: 'United Kingdom', lat: 53.8175, lng: -3.0357, avgWindSpeed: 16 },
  { name: 'Bournemouth', country: 'United Kingdom', lat: 50.7192, lng: -1.8808, avgWindSpeed: 10 },
  { name: 'Swansea', country: 'United Kingdom', lat: 51.6214, lng: -3.9436, avgWindSpeed: 14 },
  
  // United States
  { name: 'Miami Beach', country: 'United States', lat: 25.7617, lng: -80.1918, avgWindSpeed: 9 },
  { name: 'Clearwater Beach', country: 'United States', lat: 27.9759, lng: -82.8288, avgWindSpeed: 10 },
  { name: 'Huntington Beach', country: 'United States', lat: 33.6595, lng: -117.9988, avgWindSpeed: 8 },
  { name: 'La Jolla Beach', country: 'United States', lat: 32.8328, lng: -117.2713, avgWindSpeed: 7 },
  { name: 'Cannon Beach', country: 'United States', lat: 45.8918, lng: -123.9615, avgWindSpeed: 15 },
  { name: 'Seattle', country: 'United States', lat: 47.6062, lng: -122.3321, avgWindSpeed: 8 },
  { name: 'Boston', country: 'United States', lat: 42.3601, lng: -71.0589, avgWindSpeed: 12 },
  { name: 'New York', country: 'United States', lat: 40.7128, lng: -74.0060, avgWindSpeed: 11 },
  { name: 'Los Angeles', country: 'United States', lat: 34.0522, lng: -118.2437, avgWindSpeed: 6 },
  { name: 'San Francisco', country: 'United States', lat: 37.7749, lng: -122.4194, avgWindSpeed: 13 },
  { name: 'Charleston', country: 'United States', lat: 32.7765, lng: -79.9311, avgWindSpeed: 10 },
  
  // Australia
  { name: 'Surfers Paradise Beach', country: 'Australia', lat: -28.0016, lng: 153.4305, avgWindSpeed: 11 },
  { name: 'Whitehaven Beach', country: 'Australia', lat: -20.2864, lng: 149.0379, avgWindSpeed: 13 },
  { name: 'Manly Beach', country: 'Australia', lat: -33.7971, lng: 151.2880, avgWindSpeed: 12 },
  { name: 'Melbourne', country: 'Australia', lat: -37.8136, lng: 144.9631, avgWindSpeed: 14 },
  { name: 'Brisbane', country: 'Australia', lat: -27.4698, lng: 153.0251, avgWindSpeed: 9 },
  { name: 'Perth', country: 'Australia', lat: -31.9505, lng: 115.8605, avgWindSpeed: 15 },
  { name: 'Adelaide', country: 'Australia', lat: -34.9285, lng: 138.6007, avgWindSpeed: 12 },
  { name: 'Gold Coast', country: 'Australia', lat: -28.0167, lng: 153.4000, avgWindSpeed: 10 },
  
  // Japan
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, avgWindSpeed: 8 },
  { name: 'Osaka', country: 'Japan', lat: 34.6937, lng: 135.5023, avgWindSpeed: 7 },
  { name: 'Yokohama', country: 'Japan', lat: 35.4437, lng: 139.6380, avgWindSpeed: 9 },
  { name: 'Fukuoka', country: 'Japan', lat: 33.5904, lng: 130.4017, avgWindSpeed: 10 },
  
  // India
  { name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, avgWindSpeed: 8 },
  { name: 'Chennai', country: 'India', lat: 13.0827, lng: 80.2707, avgWindSpeed: 9 },
  { name: 'Kochi', country: 'India', lat: 9.9312, lng: 76.2673, avgWindSpeed: 7 },
  { name: 'Visakhapatnam', country: 'India', lat: 17.6868, lng: 83.2185, avgWindSpeed: 11 },
  
  // Europe
  { name: 'Barceloneta Beach', country: 'Spain', lat: 41.3784, lng: 2.1925, avgWindSpeed: 8 },
  { name: 'Praia da Marinha', country: 'Portugal', lat: 37.0891, lng: -8.4120, avgWindSpeed: 13 },
  { name: 'Navagio Beach', country: 'Greece', lat: 37.8594, lng: 20.6250, avgWindSpeed: 11 },
  { name: 'Elafonissi Beach', country: 'Greece', lat: 35.2719, lng: 23.5414, avgWindSpeed: 14 },
  { name: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393, avgWindSpeed: 12 },
  { name: 'Copenhagen', country: 'Denmark', lat: 55.6761, lng: 12.5683, avgWindSpeed: 14 },
  { name: 'Marseille', country: 'France', lat: 43.2965, lng: 5.3698, avgWindSpeed: 15 },
  { name: 'Nice', country: 'France', lat: 43.7102, lng: 7.2620, avgWindSpeed: 9 },
  { name: 'Naples', country: 'Italy', lat: 40.8518, lng: 14.2681, avgWindSpeed: 8 },
  { name: 'Venice', country: 'Italy', lat: 45.4408, lng: 12.3155, avgWindSpeed: 7 },
  { name: 'Athens', country: 'Greece', lat: 37.9838, lng: 23.7275, avgWindSpeed: 11 },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, avgWindSpeed: 10 },
  { name: 'Stockholm', country: 'Sweden', lat: 59.3293, lng: 18.0686, avgWindSpeed: 9 },
  { name: 'Oslo', country: 'Norway', lat: 59.9139, lng: 10.7522, avgWindSpeed: 8 },
  { name: 'Helsinki', country: 'Finland', lat: 60.1699, lng: 24.9384, avgWindSpeed: 11 },
  
  // Africa
  { name: 'Camps Bay Beach', country: 'South Africa', lat: -33.9558, lng: 18.3789, avgWindSpeed: 16 },
  { name: 'Clifton Beach', country: 'South Africa', lat: -33.9430, lng: 18.3770, avgWindSpeed: 15 },
  { name: 'Anse Source d\'Argent', country: 'Seychelles', lat: -4.3673, lng: 55.8326, avgWindSpeed: 9 },
  { name: 'Diani Beach', country: 'Kenya', lat: -4.2774, lng: 39.5910, avgWindSpeed: 11 },
  { name: 'Dakar', country: 'Senegal', lat: 14.7167, lng: -17.4677, avgWindSpeed: 14 },
  { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792, avgWindSpeed: 8 },
  { name: 'Mombasa', country: 'Kenya', lat: -4.0435, lng: 39.6682, avgWindSpeed: 9 },
  { name: 'Alexandria', country: 'Egypt', lat: 31.2001, lng: 29.9187, avgWindSpeed: 12 },
  { name: 'Casablanca', country: 'Morocco', lat: 33.5731, lng: -7.5898, avgWindSpeed: 13 },
  
  // South America
  { name: 'Praia do Forte', country: 'Brazil', lat: -12.5797, lng: -38.0189, avgWindSpeed: 10 },
  { name: 'Punta del Este Beach', country: 'Uruguay', lat: -34.9368, lng: -54.9382, avgWindSpeed: 14 },
  { name: 'Playa Blanca', country: 'Colombia', lat: 10.2508, lng: -75.5813, avgWindSpeed: 9 },
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816, avgWindSpeed: 13 },
  { name: 'Lima', country: 'Peru', lat: -12.0464, lng: -77.0428, avgWindSpeed: 7 },
  { name: 'Valparaiso', country: 'Chile', lat: -33.0472, lng: -71.6127, avgWindSpeed: 12 },
  { name: 'Cartagena', country: 'Colombia', lat: 10.3910, lng: -75.4794, avgWindSpeed: 9 },
  
  // North America
  { name: 'Vancouver', country: 'Canada', lat: 49.2827, lng: -123.1207, avgWindSpeed: 8 },
  { name: 'Halifax', country: 'Canada', lat: 44.6488, lng: -63.5752, avgWindSpeed: 15 },
  { name: 'Cancun', country: 'Mexico', lat: 21.1619, lng: -86.8515, avgWindSpeed: 11 },
  { name: 'Acapulco', country: 'Mexico', lat: 16.8531, lng: -99.8237, avgWindSpeed: 9 },
  { name: 'Havana', country: 'Cuba', lat: 23.1136, lng: -82.3666, avgWindSpeed: 10 },
  
  // Asia & Oceania
  { name: 'Piha Beach', country: 'New Zealand', lat: -36.9548, lng: 174.4686, avgWindSpeed: 17 },
  { name: 'Kuta Beach', country: 'Indonesia', lat: -8.7180, lng: 115.1686, avgWindSpeed: 8 },
  { name: 'Railay Beach', country: 'Thailand', lat: 8.0055, lng: 98.8372, avgWindSpeed: 7 },
  { name: 'Haeundae Beach', country: 'South Korea', lat: 35.1588, lng: 129.1601, avgWindSpeed: 11 },
  
  // India
  { name: 'Somnath Beach', country: 'India', lat: 20.8880, lng: 70.4004, avgWindSpeed: 12 },
  { name: 'Kutch Beach', country: 'India', lat: 23.7337, lng: 69.8597, avgWindSpeed: 14 },
  { name: 'Dumas Beach', country: 'India', lat: 21.0936, lng: 72.7177, avgWindSpeed: 11 },
  { name: 'Goa Beaches', country: 'India', lat: 15.2993, lng: 73.9840, avgWindSpeed: 9 },
  { name: 'Dwarka Beach', country: 'India', lat: 22.2442, lng: 68.9685, avgWindSpeed: 15 },
  { name: 'Diu Beach', country: 'India', lat: 20.7144, lng: 70.9874, avgWindSpeed: 13 },
  { name: 'Khambhat Beach', country: 'India', lat: 22.3131, lng: 72.6194, avgWindSpeed: 12 },
  { name: 'Juhu Beach', country: 'India', lat: 19.0883, lng: 72.8264, avgWindSpeed: 10 },
  { name: 'Thiruvananthapuram Beach', country: 'India', lat: 8.5241, lng: 76.9366, avgWindSpeed: 8 },
  { name: 'Andaman Beach', country: 'India', lat: 11.7401, lng: 92.6586, avgWindSpeed: 11 },
  { name: 'Nicobar Beach', country: 'India', lat: 7.0334, lng: 93.7996, avgWindSpeed: 12 },
  { name: 'Rameshwaram Beach', country: 'India', lat: 9.2876, lng: 79.3129, avgWindSpeed: 14 },
  { name: 'Wellington', country: 'New Zealand', lat: -41.2865, lng: 174.7762, avgWindSpeed: 19 },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, avgWindSpeed: 10 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, avgWindSpeed: 5 },
  { name: 'Hong Kong', country: 'China', lat: 22.3193, lng: 114.1694, avgWindSpeed: 11 },
  { name: 'Shanghai', country: 'China', lat: 31.2304, lng: 121.4737, avgWindSpeed: 12 },
  { name: 'Manila', country: 'Philippines', lat: 14.5995, lng: 120.9842, avgWindSpeed: 8 },
  { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, avgWindSpeed: 6 },
  { name: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.8231, lng: 106.6297, avgWindSpeed: 7 },
  { name: 'Busan', country: 'South Korea', lat: 35.1796, lng: 129.0756, avgWindSpeed: 10 },
  { name: 'Vladivostok', country: 'Russia', lat: 43.1198, lng: 131.8869, avgWindSpeed: 13 },
  { name: 'Hobart', country: 'Australia', lat: -42.8821, lng: 147.3272, avgWindSpeed: 16 },
  { name: 'Suva', country: 'Fiji', lat: -18.1416, lng: 178.4419, avgWindSpeed: 12 },
  { name: 'Honolulu', country: 'United States', lat: 21.3069, lng: -157.8583, avgWindSpeed: 11 },
];