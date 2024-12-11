import React, { useState, useEffect } from 'react';
import { basic_API_url } from './global_const.js';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import PropTypes from 'prop-types';

// Register Chart.js modules
ChartJS.register(BarElement, CategoryScale, LinearScale);

async function getData(username, apikey, startDate, endDate) {
  const postData = new FormData();
  const fetchURL = basic_API_url() + "php/mebyme.php";

  postData.append('username', username);
  postData.append('apikey', apikey);
  postData.append('startDate', startDate);
  postData.append('endDate', endDate);
  postData.append('action', 'get_hgh_day_summary');

  const requestOptions = {
    method: 'POST',
    body: postData,
  };

  try {
    const res = await fetch(fetchURL, requestOptions);
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

function GraphMyData({ startDate, endDate, username, apikey }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const data = await getData(username, apikey, startDate, endDate);

        let dayData = data.groupedData;
        const labels = dayData[0]?.data.map(item => item.datum); // Extract dates from the first dataset

        // Create datasets for each aspect_type, giving each a unique color
        const colors = [
          'rgba(75, 192, 192, 0.6)',  // Color 1
          'rgba(255, 99, 132, 0.6)',  // Color 2
          'rgba(54, 162, 235, 0.6)',  // Color 3
          'rgba(255, 159, 64, 0.6)',  // Color 4
          'rgba(153, 102, 255, 0.6)', // Color 5
          'rgba(255, 205, 86, 0.6)'   // Color 6
        ];

        const datasets = dayData.map((aspect, index) => ({
          label: aspect.aspect_type, // Use aspect_type as the label
          data: aspect.data.map(item => item.max), // Get the max values from the data array
          backgroundColor: colors[index % colors.length], // Assign a unique color for each dataset
          borderColor: colors[index % colors.length].replace('0.6', '1'), // Slightly darker border
          borderWidth: 1,
        }));

        // Set chart data
        setChartData({
          labels, // x-axis labels (dates)
          datasets, // y-axis datasets per aspect_type
        });
      } catch (err) {
        setError('Failed to load data.');
        console.log(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [startDate, endDate, username, apikey]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return chartData ? (
    <div>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              display: true, // Enable legends for clickable interaction
              position: 'top',
              onClick: (e, legendItem) => {
                const chart = e.chart;
                const index = legendItem.datasetIndex; // Get the index of the clicked legend item
                const meta = chart.getDatasetMeta(index);

                // Toggle visibility of the dataset
                meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
                chart.update(); // Update chart to reflect visibility change
              },
            },
          },
          interaction: {
            mode: 'index', // Handle interaction by index
            intersect: false,
          },
          scales: {
            x: {
              type: 'category',
              labels: chartData.labels, // Reference the labels from chartData
            },
            y: {
              min: 0, // Optional: Ensure y-axis starts at 0
            },
          },
        }}
      />
    </div>
  ) : (
    <p>No data available.</p>
  );
}

// PropType validation
GraphMyData.propTypes = {
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  apikey: PropTypes.string.isRequired,
};

export default GraphMyData;