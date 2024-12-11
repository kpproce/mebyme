import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';  // Dit is toegevoegd
import { basic_API_url } from './global_const.js';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js modules
ChartJS.register(BarElement, CategoryScale, LinearScale);

async function getData(username, apikey, startDate, endDate) {
  const postData = new FormData();
  const fetchURL = basic_API_url() + 'php/mebyme.php';

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

        // Function to generate color based on value
        const getColorForValue = (value, aspectType) => {
          let color = '';
          if (aspectType === 'welzijn') {
            const intensity = Math.min(255, value * 50); // Scale max value to color range
            color = `rgba(${255}, ${intensity}, ${intensity}, 0.6)`; // Light red to dark red
          } else if (aspectType === 'medicatie') {
            const intensity = Math.min(255, value * 50); // Scale max value to color range
            color = `rgba(${intensity}, ${intensity}, ${255}, 0.6)`; // Light blue to dark blue
          } else if (aspectType === 'gedaan') {
            const intensity = Math.min(255, value * 50); // Scale max value to color range
            color = `rgba(${intensity}, ${255}, ${intensity}, 0.6)`; // Light green to dark green
          }
          return color;
        };

        // Dynamically generate datasets based on aspect type and data
        const datasets = dayData.map((aspect) => ({
          label: aspect.aspect_type, // Use aspect_type as the label
          data: aspect.data.map(item => item.max), // Get the max values from the data array
          backgroundColor: aspect.data.map(item => getColorForValue(item.max, aspect.aspect_type)),
          borderColor: aspect.data.map(item => getColorForValue(item.max, aspect.aspect_type).replace('0.6', '1')), // Darker borders
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
              display: true,
              position: 'top',
              labels: {
                usePointStyle: true,
                boxWidth: 20,
                padding: 15,
              },
              onClick: (e, legendItem) => {
                const chart = e.chart;
                const index = legendItem.datasetIndex;
                const meta = chart.getDatasetMeta(index);

                // Toggle visibility of the dataset
                meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
                chart.update(); // Update chart to reflect visibility change
              },
            },
          },
          interaction: {
            mode: 'index',
            intersect: false,
          },
          scales: {
            x: {
              type: 'category',
              labels: chartData.labels,
            },
            y: {
              min: 0,
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