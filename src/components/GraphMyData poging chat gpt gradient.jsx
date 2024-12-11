import React, { useState, useEffect } from 'react';
import { basic_API_url } from './global_const.js';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import PropTypes from 'prop-types';

// Register Chart.js modules
ChartJS.register(BarElement, CategoryScale, LinearScale, Legend);

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
        const labels = dayData[0]?.data.map(item => item.datum);

        const datasets = dayData.map((aspect, index) => {
          return {
            label: aspect.aspect_type,
            data: aspect.data.map(item => item.max + 1),
            backgroundColor: aspect.data.map((item, i) => {
              return (context) => {
                const chart = context.chart;
                const ctx = chart.ctx;
                const yPosition = chart.getDatasetMeta(index).data[i].y;
                const height = chart.height;

                // Maak een gradient voor elke individuele bar
                const gradient = ctx.createLinearGradient(0, height - yPosition, 0, height - yPosition - 50);
                gradient.addColorStop(0, 'rgba(75, 192, 192, 0.6)'); // Startkleur
                gradient.addColorStop(1, 'rgba(255, 99, 132, 0.6)'); // Eindkleur
                return gradient;
              };
            }),
            borderColor: 'rgba(75, 192, 192, 1)', // De randkleur voor alle bars
            borderWidth: 1,
          };
        });

        setChartData({
          labels,
          datasets,
        });
      } catch (err) {
        setError('Failed to load data.');
        console.error(err);
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
            },
          },
          interaction: {
            mode: 'index',
            intersect: false,
          },
          scales: {
            x: {
              type: 'category',
              labels: chartData?.labels || [],
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

GraphMyData.propTypes = {
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  apikey: PropTypes.string.isRequired,
};

export default GraphMyData;
