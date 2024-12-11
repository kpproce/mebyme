import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Eenmalige registratie van modules
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);